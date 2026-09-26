const userModel=require('../models/user.model')
const jwt=require('jsonwebtoken')
const bcrypt=require('bcrypt')
const crypto=require('crypto')
const { OAuth2Client } = require('google-auth-library')
const {sendEmail}=require('../services/email.service')

const googleClient = new OAuth2Client(process.env.GOOGLE_AUTH_CLIENT_ID)

const OTP_EXPIRY_MINUTES=10
const OTP_MAX_ATTEMPTS=5
const OTP_RESEND_COOLDOWN_SECONDS=60

function createOtp(){
    return crypto.randomInt(0,1000000).toString().padStart(6,'0')
}

function hashOtp(otp){
    return crypto.createHmac('sha256',process.env.JWT_SECRET).update(otp).digest('hex')
}

function createAuthToken(user){
    return jwt.sign({id:user._id,role:user.role},process.env.JWT_SECRET)
}

function setAuthCookie(res,user){
    res.cookie('token',createAuthToken(user))
}

function userResponse(user){
    return {
        id:user._id,
        name:user.name,
        email:user.email,
        phone:user.phone,
        role:user.role
    }
}

async function sendVerificationOtp(user,otp){
    const text=`Your CafeQ verification code is ${otp}. It expires in ${OTP_EXPIRY_MINUTES} minutes. Do not share this code with anyone.`
    const html=`<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#222"><h2>CafeQ email verification</h2><p>Use this code to verify your CafeQ account:</p><p style="font-size:28px;font-weight:bold;letter-spacing:6px">${otp}</p><p>This code expires in ${OTP_EXPIRY_MINUTES} minutes.</p><p>Do not share this code with anyone.</p></div>`
    await sendEmail(user.email,'Your CafeQ verification code',text,html)
}

async function registerUser(req,res){
    const {name,email,password,phone}=req.body || {}
    if(!name || !email || !password || !phone){
        return res.status(400).json({message:'Name, email, password, and phone are required'})
    }

    const normalizedEmail=String(email).trim().toLowerCase()
    const isUserExist=await userModel.findOne({$or:[{email:normalizedEmail},{phone}]})
    if(isUserExist){
        return res.status(400).json({message:'User already exists'})
    }

    const hash=await bcrypt.hash(password,10)
    const otp=createOtp()
    const now=new Date()
    const user=await userModel.create({
        name,
        email:normalizedEmail,
        password:hash,
        phone,
        isVerified:false,
        otpHash:hashOtp(otp),
        otpExpiresAt:new Date(now.getTime()+OTP_EXPIRY_MINUTES*60*1000),
        otpAttempts:0,
        otpSentAt:now
    })

    try{
        await sendVerificationOtp(user,otp)
    }catch(error){
        await userModel.deleteOne({_id:user._id})
        console.error('Error sending registration verification email:',error)
        return res.status(500).json({message:'Unable to send verification email. Please try again.'})
    }

    return res.status(201).json({
        message:'Verification code sent to your email. Please verify your email to complete registration.',
        requiresEmailVerification:true,
        email:user.email
    })
}

async function verifyOtp(req,res){
    const {email,otp}=req.body || {}
    if(!email || !otp || !/^\d{6}$/.test(String(otp))){
        return res.status(400).json({message:'A valid email and 6-digit OTP are required'})
    }
    const user=await userModel.findOne({email:String(email).trim().toLowerCase()})
    if(!user){
        return res.status(404).json({message:'User does not exist'})
    }
    if(user.isVerified){
        return res.status(400).json({message:'Email is already verified'})
    }
    if(user.otpAttempts>=OTP_MAX_ATTEMPTS){
        return res.status(429).json({message:'OTP attempt limit reached. Please request a new code.'})
    }
    if(!user.otpHash || !user.otpExpiresAt || user.otpExpiresAt.getTime()<=Date.now()){
        return res.status(400).json({message:'OTP has expired. Please request a new code.'})
    }

    const expected=Buffer.from(user.otpHash,'hex')
    const submitted=Buffer.from(hashOtp(String(otp)),'hex')
    if(expected.length!==submitted.length || !crypto.timingSafeEqual(expected,submitted)){
        user.otpAttempts+=1
        await user.save()
        return res.status(400).json({
            message:'Invalid OTP',
            attemptsRemaining:Math.max(OTP_MAX_ATTEMPTS-user.otpAttempts,0)
        })
    }

    user.isVerified=true
    user.otpHash=undefined
    user.otpExpiresAt=undefined
    user.otpAttempts=0
    user.otpSentAt=undefined
    await user.save()
    setAuthCookie(res,user)
    return res.status(200).json({message:'Email verified successfully',user:userResponse(user)})
}

async function resendOtp(req,res){
    const {email}=req.body || {}
    if(!email){
        return res.status(400).json({message:'Email is required'})
    }
    const user=await userModel.findOne({email:String(email).trim().toLowerCase()})
    if(!user){
        return res.status(404).json({message:'User does not exist'})
    }
    if(user.isVerified){
        return res.status(400).json({message:'Email is already verified'})
    }

    const cooldownRemaining=user.otpSentAt
        ? OTP_RESEND_COOLDOWN_SECONDS-Math.floor((Date.now()-user.otpSentAt.getTime())/1000)
        : 0
    if(cooldownRemaining>0){
        return res.status(429).json({message:'Please wait before requesting another OTP',retryAfterSeconds:cooldownRemaining})
    }

    const otp=createOtp()
    const now=new Date()
    user.otpHash=hashOtp(otp)
    user.otpExpiresAt=new Date(now.getTime()+OTP_EXPIRY_MINUTES*60*1000)
    user.otpAttempts=0
    user.otpSentAt=now
    await user.save()
    try{
        await sendVerificationOtp(user,otp)
    }catch(error){
        console.error('Error sending resend verification email:',error)
        return res.status(500).json({message:'Unable to send verification email. Please try again.'})
    }
    return res.status(200).json({message:'A new verification code has been sent to your email.'})
}

async function loginUser(req,res){
    const {email,phone,password}=req.body || {}
    if((!email && !phone) || !password){
        return res.status(400).json({message:'Email or phone and password are required'})
    }

    const user=await userModel.findOne({$or:[{phone},{email}]})
    if(!user){
        return res.status(400).json({message:'User does not exist'})
    }
    const isPasswordValid=await bcrypt.compare(password,user.password)
    if(!isPasswordValid){
        return res.status(400).json({message:'Invalid Password'})
    }
    if(!user.isVerified){
        return res.status(403).json({
            success:false,
            code:'ACCOUNT_NOT_VERIFIED',
            message:'Please verify your account before logging in.',
            email:user.email
        })
    }

    setAuthCookie(res,user)
    return res.status(200).json({message:'User logged in successfully',user:userResponse(user)})
}

async function logoutUser(req,res){
    res.clearCookie('token')
    res.status(200).json({message:'User logged out successfully'})
}

async function getMe(req,res){
    return res.status(200).json({
        message:'User fetched successfully',
        user:{
            id:req.user._id,
            name:req.user.name,
            email:req.user.email,
            phone:req.user.phone,
            role:req.user.role,
            isVerified:req.user.isVerified
        }
    })
}

async function googleLogin(req, res) {
    try {
        const { credential } = req.body || {};
        if (!credential) {
            return res.status(400).json({ message: 'Google credential is required' });
        }

        const googleClientId = process.env.GOOGLE_AUTH_CLIENT_ID || process.env.GOOGLE_AUTHCLIENT_ID || process.env.GOOGLE_CLIENT_ID;
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: googleClientId
        });

        const payload = ticket.getPayload();
        if (!payload || !payload.email) {
            return res.status(400).json({ message: 'Invalid Google credential' });
        }

        const normalizedEmail = payload.email.trim().toLowerCase();
        let user = await userModel.findOne({ email: normalizedEmail });

        if (!user) {
            user = await userModel.create({
                name: payload.name || payload.email.split('@')[0],
                email: normalizedEmail,
                role: 'CUSTOMER',
                isVerified: true
            });
        } else {
            if (!user.isVerified) {
                user.isVerified = true;
                await user.save();
            }
        }

        setAuthCookie(res, user);
        return res.status(200).json({
            message: 'User logged in successfully',
            user: userResponse(user)
        });
    } catch (error) {
        console.error('Google authentication error:', error);
        return res.status(401).json({ message: 'Invalid or expired Google token' });
    }
}

module.exports={registerUser,verifyOtp,resendOtp,loginUser,logoutUser,getMe,googleLogin}
