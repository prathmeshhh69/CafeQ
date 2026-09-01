const express=require('express')
const authMiddleware=require('../middlewares/auth.middleware')
const paymentController=require('../controllers/payment.controller')
const router=express.Router()

router.post('/createpaymentorder',authMiddleware.authenticate,paymentController.createPaymentOrder);
router.post('/verifypayment',authMiddleware.authenticate,paymentController.verifyPayment);

module.exports=router;