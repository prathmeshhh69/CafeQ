const express=require('express')
const timeSlotController=require('../controllers/timeSlot.controller')
const authMiddleware=require('../middlewares/auth.middleware')

const router=express.Router()

router.post('/timeslot',authMiddleware.authenticate,authMiddleware.authorize, timeSlotController.createTimeSlot);
router.get('/', authMiddleware.authenticate, timeSlotController.getTimeSlots);
router.patch('/:id', authMiddleware.authenticate, authMiddleware.authorize, timeSlotController.updateTimeSlot);
router.patch('/:id/deactivate', authMiddleware.authenticate, authMiddleware.authorize, timeSlotController.deactivateTimeSlot);

module.exports=router;