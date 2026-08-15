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

async function loginUser(req,res){
    const {email,phone,password}=req.body;

    const user=await userModel.findOne({
        $or:[
            {phone},
            {email}
        ]
    })

    if(!user){
        return res.status(400).json({
            message:"User does not exist"
        })
    }
    const isPasswordValid=await bcrypt.compare(password,user.password)
    if(!isPasswordValid){
        return res.status(400).json({
            message:"Invalid Password"
        })
    }

    const token=jwt.sign({
        id:user._id,
        role:user.role
    },process.env.JWT_SECRET)

    res.cookie('token',token)

    res.status(200).json({
        message:"User logged in successfully",
        user:{
            id:user._id,
            name:user.name,
            email:user.email,
            phone:user.phone,
            role:user.role
        }
    })
}

async function logoutUser(req,res){
    res.clearCookie('token')
    res.status(200).json({
        message:"User logged out successfully"
    })
}

async function getMe(req,res){
        return res.status(200).json({
        message: 'User fetched successfully',
        user: {
            id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            phone: req.user.phone,
            role: req.user.role,
            isVerified: req.user.isVerified
        }
    });
}
module.exports={registerUser,loginUser,logoutUser,getMe}