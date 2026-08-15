const mongoose=require('mongoose')


const cartItemSchema=new mongoose.Schema({
  menuItem:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'menu',
    required:true
  },
  quantity:{
    type:Number,
    required:true,
    min:1,
    default:1
  },
  price:{
    type:Number,
    required:true,
    min:0
  }
}, {
    _id:false
})
const cartSchema=new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user',
        required:true,
        unique:true
    },
    items:
        {
     type:[cartItemSchema],
     default:[]
        }
}, {timestamps:true})

const cartModel=mongoose.model('cart', cartSchema);

module.exports=cartModel;