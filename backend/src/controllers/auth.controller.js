const userModel=require('../models/user.model')
const jwt=require('jsonwebtoken')
const bcrypt=require('bcryptjs')

async function registerUser(req,res){
    const {name,email,password,phone,role='CUSTOMER'}=req.body;

    const isUserExist=await userModel.findOne({
        $or:[
            {email},
            {phone}
        ]
    })
    if(isUserExist){
        return res.status(400).json({message:'User already exists'})
    }

    const hash=await bcrypt.hash(password,10)
    const user=await userModel.create({
        name,
        email,
        password:hash,
        phone,
        role
    })
    const token=jwt.sign({
        id:user._id,
        role:user.role
    },process.env.JWT_SECRET)

    res.cookie('token',token);

    res.status(201).json({
        message:'User registered successfully',
        user:{
            id:user._id,
            name:user.name,
            email:user.email,
            phone:user.phone,
            role:user.role
        }
    })
   
}

module.exports={registerUser}