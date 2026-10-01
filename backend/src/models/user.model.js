const mongoose=require('mongoose')
const { generateUniqueCode } = require('../utils/code.util');

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
    },
    phone:{
        type:String,
    },
    role:{
        type:String,
        enum:['CUSTOMER','ADMIN'],
        default:'CUSTOMER'
    },
    customerCode:{
        type:String,
        required:function(){ return this.role === 'CUSTOMER'; }
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

userSchema.index(
    { customerCode: 1 },
    { unique: true, partialFilterExpression: { customerCode: { $type: 'string' } } }
);

userSchema.pre('validate', async function(){
    if (this.role === 'CUSTOMER' && !this.customerCode) {
        this.customerCode = await generateUniqueCode(
            mongoose.model('user'),
            'customerCode',
            code => `CFA-${code}`
        );
    }
});

const userModel=mongoose.model('user', userSchema);

module.exports=userModel;
