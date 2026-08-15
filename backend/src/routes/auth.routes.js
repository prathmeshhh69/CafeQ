const express=require('express')
const authController=require('../controllers/auth.controller')
const authMiddleware=require('../middlewares/auth.middleware')
const menuController=require('../controllers/menu.controller')
const router=express.Router()

router.post('/register',authController.registerUser)
router.post('/login',authController.loginUser)
router.post('/logout',authController.logoutUser)
router.get('/me',authMiddleware.authenticate,authController.getMe)
router.get('/admin',authMiddleware.authenticate,authMiddleware.authorize,async(req,res)=>{
    return res.status(200).json({
        message:'Welcome Admin nigga'
    })
})


module.exports=router
