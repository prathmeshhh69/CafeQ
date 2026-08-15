const jwt = require('jsonwebtoken');
const userModel = require('../models/user.model');

async function authenticate(req, res, next) {
    
    try {
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({
                message: 'Unauthorized'
            });
        }
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );
        const user = await userModel.findById(decoded.id);
        if (!user) {
            return res.status(401).json({
                message: 'User not found'
            });
        }
        req.user = user;

        next();

    } catch (error) {
        console.log(error)
        return res.status(401).json({
            message: 'Unauthorized (authenticate)'
        });
    }
}

async function authorize(req,res,next){
    if(req.user.role!=='ADMIN'){
        return res.status(403).json({
            message:'Forbidden'
        })
    }
    next();
}

module.exports = { authenticate,authorize };