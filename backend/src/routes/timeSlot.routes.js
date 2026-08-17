const express=require('express')
const timeSlotController=require('../controllers/timeSlot.controller')
const authMiddleware=require('../middlewares/auth.middleware')

const router=express.Router()

router.post('/timeslot',authMiddleware.authenticate,authMiddleware.authorize, timeSlotController.createTimeSlot);

module.exports=router;