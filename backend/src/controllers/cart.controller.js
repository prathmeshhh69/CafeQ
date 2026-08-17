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
async function getCart(req,res){
     try{
        const userId=req.user._id
        const cart=await cartModel.findOne({user:userId}).populate('items.menuItem')
        if(!cart){
            return res.status(404).json({
                message:"Cart not found"
            })
        }
        const cartItems=cart.items.map(item=>({
            menuItem:item.menuItem,
            quantity:item.quantity,
            price:item.price,
            itemTotal:item.price*item.quantity
        }))

        const cartTotal=cartItems.reduce((total,item)=> total+item.itemTotal,0)
        return res.status(200).json({
            message:"Cart fetched successfully",
            items:cartItems,
            cart
        })
     }catch(err){
        console.log(err)
        return res.status(500).json({
            message:"Failed to fetch cart"
        })
     }
}

async function updateCartItem(req,res){
    try{
        const {menuItemId}=req.params
        const {quantity}=req.body
        const userId=req.user._id

        if(!quantity || quantity<1){
            return res.status(400).json({
                message:"Quantity should be 1 or more than 1"
            })
        }
        const cart=await cartModel.findOne({user:userId})
        if(!cart){
            return res.status(404).json({
                message:"Cart not found"
            })
        }
        const item=cart.items.find(item=>item.menuItem.toString()===menuItemId.toString())
        if(!item){
            return res.status(404).json({
                message:"Item not found in cart"
            })
        }
        item.quantity=quantity
        await cart.save()

        return res.status(200).json({
            message:"Cart item updated successfully",
            cart
        })
        
    }catch(err){
        console.error(err)
        return res.status(500).json({
            message:"Failed to update cart item"
        })
    }
}

async function removeCartItem(req,res){
    try{
        const {menuItemId}=req.params
        const userId=req.user._id

        const cart=await cartModel.findOne({user:userId})
        if(!cart){
            return res.status(404).json({
                message:"Cart not found"
            })
        }
        const itemIndex=cart.items.findIndex(item=>item.menuItem.toString()===menuItemId.toString())
        if(itemIndex===-1){
            return res.status(404).json({
                message:"Item not found in cart"
            })
        }  
        cart.items.splice(itemIndex,1)
        await cart.save()

        return res.status(200).json({
            message:"Cart item removed successfully",
            cart
        })

    }catch(err){
        console.log(err);
        return res.status(500).json({
            message:"Failed to remove item from cart"
        })
    }
}

async function clearCart(req,res){
   try{
    const userId=req.user._id
    const cart=await cartModel.findOne({user:userId})
    if(!cart){
        return res.status(404).json({
            message:"Cart not found"
        })
    }
    cart.items=[]
    await cart.save()
    return res.status(200).json({
        message:"Cart cleared successfully",    
    })
   }catch(err){
    console.log(err)
    return res.status(500).json({
        message:"Failed to clear cart"
    })
   }
}
module.exports={addtoCart, getCart,updateCartItem,removeCartItem,clearCart}