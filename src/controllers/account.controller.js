const accountModel = require('../models/account.model')

async function createAccountController(req,res){
    const user = req.user

    const account = await accountModel.create({
        user : user._id
    })

    res.status(201).json({
        message : "Account Created",
        account : account 
    })
}

async function getUserAccountsController(req,res){
    const accounts = await accountModel.find({user : req.user._id})

    res.status(200).json({
        accounts
    })
}

async function getAccountBalance(req,res){
    const {accountID} = req.params

    const account = await accountModel.findOne({
        _id : accountID,
        user : req.user._id
    })

    if(!account){
        return res.status(404).json({
            message : "Account not found"
        })
    }

    const balance = await account.getBalance()
    
    return res.status(200).json({
        accountID : account._id,
        balance : balance
    })
}

module.exports = {createAccountController , getUserAccountsController , getAccountBalance}