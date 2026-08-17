const express=require('express')
const cartController=require('../controllers/cart.controller')
const authMiddleware=require('../middlewares/auth.middleware')
const router=express.Router()

router.post('/add-to-cart',authMiddleware.authenticate,cartController.addtoCart);
router.get('/get-cart',authMiddleware.authenticate,cartController.getCart);
router.patch('/update-cart/:menuItemId',authMiddleware.authenticate,cartController.updateCartItem);
router.delete('/remove-cart/:menuItemId',authMiddleware.authenticate,cartController.removeCartItem);
router.delete('/clear',authMiddleware.authenticate,cartController.clearCart);

module.exports=router;