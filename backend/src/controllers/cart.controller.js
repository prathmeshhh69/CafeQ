const cartModel=require('../models/cart.model')
const menuModel=require('../models/menu.model')

async function addtoCart(req,res){
    try{
        const {menuItemId,quantity}=req.body
        const userId=req.user._id
    
        if(!menuItemId || !quantity){
            return res.status(400).json({
                message:"Menu Item and quantity are required"
            })
        }

         if(quantity<1){
            return res.status(400).json({
                message:"Quantity should be 1 or more than 1"
            })
         }

         const menuItem=await menuModel.findById(menuItemId);
         if(!menuItem){
            return res.status(404).json({
                message:"Menu item not found"
            })
         }

         let cart=await cartModel.findOne({user:userId})

         if(!cart){
            cart = await cartModel.create({
                user:userId,
                items:[{
                        menuItem: menuItem._id,
                        quantity: quantity,
                        price: menuItem.price
                }]
            })
                     return res.status(200).json({
            message:"Item added to cart successfully",
            cart
         })
         }
               const existingItem = cart.items.find(
            item => item.menuItem.toString() === menuItemId.toString()
        )
                if (existingItem) {
            existingItem.quantity += quantity
            existingItem.price = menuItem.price
        } else {
            cart.items.push({
                menuItem: menuItem._id,
                quantity: quantity,
                price: menuItem.price
            })
        }
        await cart.save()

        return res.status(200).json({
            message: "Item added to cart",
            cart
        })
    }catch(err){
        console.error(err)
        return res.status(500).json({
            message:"Failed to add item to cart"
        })
    }
}


module.exports={addtoCart}