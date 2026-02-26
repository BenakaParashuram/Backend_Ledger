const userModel = require('../models/user.model')
const jwt = require('jsonwebtoken')
const emailService = require('../services/email.service')

async function userRegisteredController(req,res){
    const {email,name,password} = req.body

    const isExists = await userModel.findOne({
        email : email
    })

    if(isExists){
        return res.status(422).json({
            message : "User aldready exists",
            status : "failed"
        })
    }

    const user = await userModel.create({
        email,password,name
    })

    const token = jwt.sign({userID:user._id},process.env.JWT_SECRET,{expiresIn : "3d"})

    res.cookie("token" , token)

    res.status(201).json({
        user : {
            _id : user._id,
            email : user.email,
            name : user.name
        },
        message : "User Created Successfully"
    })

    await emailService.sendRegistrationEmail(user.email , user.name)
}

async function userLoginController(req,res){
    const {email,password} = req.body

    const user = await userModel.findOne({
        email : email
    }).select("+password")

    if(!user){
        return res.status(401).json({
            message : "User Not Found"
        })
    }

    const isValidpassword = user.comparePassword(password)

    if(!isValidpassword){
        return res.stauts(401).json({
            message : "Password Wrong"
        })
    }
    
    const token = jwt.sign({userID:user._id},process.env.JWT_SECRET,{expiresIn : "3d"})

    res.cookie("token" , token)

    res.status(200).json({
        user : {
            _id : user._id,
            email : user.email,
            name : user.name
        },
        message : "Login Successfull"
    })
}


module.exports = {userRegisteredController , userLoginController}