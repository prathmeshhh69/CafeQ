const express=require('express')
const menuController=require('../controllers/menu.controller')
const authMiddleware=require('../middlewares/auth.middleware')
const router=express.Router()

router.post('/menu',authMiddleware.authenticate,authMiddleware.authorize,menuController.createmenuItem);
router.get('/menu',authMiddleware.authenticate,menuController.getMenuItems);
router.put('/menu/:id',authMiddleware.authenticate,authMiddleware.authorize,menuController.updateMenuItem);
router.delete('/menu/:id',authMiddleware.authenticate,authMiddleware.authorize,menuController.deleteMenuItem);
module.exports=router