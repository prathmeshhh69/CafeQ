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

module.exports={createTimeSlot}