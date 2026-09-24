const mongoose=require('mongoose')

const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        unique:true,
        required:true,
        lowercase:true
    },
    password:{
        type:String,
        required:true,
    },
    phone:{
        type:String,
        required:true
    },
    role:{
        type:String,
        enum:['CUSTOMER','ADMIN'],
        default:'CUSTOMER'
    },
    isVerified:{
        type:Boolean,
        default:false
    },
    otpHash:{
        type:String
    },
    otpExpiresAt:{
        type:Date
    },
    otpSentAt:{
        type:Date
    },
    otpAttempts:{
        type:Number,
        default:0
    }
}, {timestamps:true})

const userModel=mongoose.model('user', userSchema);

module.exports=userModel;
