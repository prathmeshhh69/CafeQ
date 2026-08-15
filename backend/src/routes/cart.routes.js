const express=require('express')
const cartController=require('../controllers/cart.controller')
const authMiddleware=require('../middlewares/auth.middleware')
const router=express.Router()

router.post('/add-to-cart',authMiddleware.authenticate,cartController.addtoCart);

module.exports=router;