const mongoose=require('mongoose')

const menuSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    description:{
        type:String,
    },
    price:{
        type:Number,
        required:true
    },
    category:{
        type:String,
        required:true
    },
    image:{
        type:String,
    },
    isAvailable:{
        type:Boolean,
        default:true
    }
},{timestamps:true})

const menuModel=mongoose.model('menu', menuSchema);

module.exports=menuModel;