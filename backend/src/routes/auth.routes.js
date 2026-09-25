const express=require('express')
const authController=require('../controllers/auth.controller')
const authMiddleware=require('../middlewares/auth.middleware')
const menuController=require('../controllers/menu.controller')
const router=express.Router()

router.post('/register',authController.registerUser)
router.post('/verify-otp',authController.verifyOtp)
router.post('/resend-otp',authController.resendOtp)
router.post('/login',authController.loginUser)
router.post('/logout',authController.logoutUser)
router.get('/me',authMiddleware.authenticate,authController.getMe)
module.exports=router
