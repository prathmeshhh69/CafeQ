const mongoose=require('mongoose')
const timeSlotModel=require('../models/timeSlot.model')

async function createTimeSlot(req,res){
    try{
        const {date,startTime,endTime,maxOrders}=req.body

    if(!date || !startTime || !endTime || maxOrders ==undefined){
        return res.status(400).json({
            message:"All fields are required"
        })
    }
     if (!Number.isInteger(maxOrders) || maxOrders < 1) {
            return res.status(400).json({
                message: "maxOrders must be a positive integer"
            })
        }
    if(startTime>=endTime){
        return res.status(400).json({
            message:"Start time must be before end time"
        })
    }
     const existingTimeSlot = await timeSlotModel.findOne({
        date,
        startTime,
         endTime
        })
    if(existingTimeSlot){
        return res.status(400).json({
            message:"Time slot already exists"
        })
    }
    const newTimeSlot=await timeSlotModel.create({
        date:date,
        startTime:startTime,
        endTime:endTime,
        maxOrders:maxOrders
    })
    res.status(201).json({
        message:"Time slot created successfully",
        timeSlot:newTimeSlot
    })
}catch(err){
    console.error(err)
    return res.status(500).json({
        message:"Internal server error"
    })
}
    }

async function getTimeSlots(req, res) {
    try {
        const { date } = req.query;
        if (!date) {
            return res.status(400).json({
                message: "Date query parameter is required"
            });
        }
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            return res.status(400).json({
                message: "Date must be in YYYY-MM-DD format"
            });
        }
        const searchDate = new Date(date);
        if (isNaN(searchDate.getTime())) {
            return res.status(400).json({
                message: "Invalid date format"
            });
        }

        const startOfDay = new Date(searchDate);
        startOfDay.setUTCHours(0, 0, 0, 0);
        const endOfDay = new Date(searchDate);
        endOfDay.setUTCHours(23, 59, 59, 999);

        const slots = await timeSlotModel.find({
            date: { $gte: startOfDay, $lte: endOfDay },
            isActive: true
        });

        const mappedSlots = slots.map(slot => {
            const slotObj = slot.toObject();
            slotObj.availableOrders = Math.max(0, slotObj.maxOrders - (slotObj.currentOrders || 0));
            return slotObj;
        });

        return res.status(200).json({
            message: "Time slots fetched successfully",
            timeSlots: mappedSlots
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
}

async function updateTimeSlot(req, res) {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid time slot ID"
            });
        }

        const { date, startTime, endTime, maxOrders, isActive } = req.body;

        if (date !== undefined) {
            if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
                return res.status(400).json({
                    message: "Date must be in YYYY-MM-DD format"
                });
            }
            const parsedDate = new Date(date);
            if (isNaN(parsedDate.getTime())) {
                return res.status(400).json({
                    message: "Invalid date format"
                });
            }
        }

        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (startTime !== undefined && !timeRegex.test(startTime)) {
            return res.status(400).json({
                message: "startTime must be in HH:mm format"
            });
        }
        if (endTime !== undefined && !timeRegex.test(endTime)) {
            return res.status(400).json({
                message: "endTime must be in HH:mm format"
            });
        }

        if (maxOrders !== undefined) {
            if (!Number.isInteger(maxOrders) || maxOrders < 1) {
                return res.status(400).json({
                    message: "maxOrders must be a positive integer"
                });
            }
        }

        const existingSlot = await timeSlotModel.findById(id);
        if (!existingSlot) {
            return res.status(404).json({
                message: "Time slot not found"
            });
        }

        const newDate = date !== undefined ? new Date(date) : existingSlot.date;
        const newStartTime = startTime !== undefined ? startTime : existingSlot.startTime;
        const newEndTime = endTime !== undefined ? endTime : existingSlot.endTime;

        if (newStartTime >= newEndTime) {
            return res.status(400).json({
                message: "Start time must be before end time"
            });
        }

        const willBeActive = isActive !== undefined ? isActive : existingSlot.isActive;
        if (willBeActive) {
            const startOfDay = new Date(newDate);
            startOfDay.setUTCHours(0, 0, 0, 0);
            const endOfDay = new Date(newDate);
            endOfDay.setUTCHours(23, 59, 59, 999);

            const overlappingSlots = await timeSlotModel.find({
                _id: { $ne: id },
                date: { $gte: startOfDay, $lte: endOfDay },
                isActive: true
            });

            const hasOverlap = overlappingSlots.some(slot => {
                return slot.startTime < newEndTime && newStartTime < slot.endTime;
            });

            if (hasOverlap) {
                return res.status(400).json({
                    message: "Time slot overlaps with an existing active time slot"
                });
            }
        }

        if (date !== undefined) existingSlot.date = new Date(date);
        if (startTime !== undefined) existingSlot.startTime = startTime;
        if (endTime !== undefined) existingSlot.endTime = endTime;
        if (maxOrders !== undefined) existingSlot.maxOrders = maxOrders;
        if (isActive !== undefined) existingSlot.isActive = isActive;

        const updatedSlot = await existingSlot.save();

        return res.status(200).json({
            message: "Time slot updated successfully",
            timeSlot: updatedSlot
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
}

async function deactivateTimeSlot(req, res) {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                message: "Invalid time slot ID"
            });
        }

        const slot = await timeSlotModel.findById(id);
        if (!slot) {
            return res.status(404).json({
                message: "Time slot not found"
            });
        }

        slot.isActive = false;
        await slot.save();

        return res.status(200).json({
            message: "Time slot deactivated successfully",
            timeSlot: slot
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
}

module.exports={
    createTimeSlot,
    getTimeSlots,
    updateTimeSlot,
    deactivateTimeSlot
}