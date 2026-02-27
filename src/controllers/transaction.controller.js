const transactionModel = require('../models/transaction.model')
const accountModel = require('../models/account.model')
const ledgerModel = require('../models/ledger.model')
const emailService = require('../services/email.service')
const mongoose = require('mongoose')


async function createTransaction(req,res){
    // check if all data recieved to create ransaction

    const {fromAccount , toAccount , amount , idempotencyKey} = req.body

    if(!fromAccount || !toAccount || !amount || !idempotencyKey){
        return res.status(400).json({
            message : "Missing Details , All are required"
        })
    }

    const fromuserAccount = await accountModel.findOne({
        _id: fromAccount
    })
    const touserAccount = await accountModel.findOne({
        _id: toAccount
    })

    if(!fromuserAccount || !touserAccount){
        return res.status(400).json({
            message : "Accounts Does not exist"
        })
    }

    // check if any transaction exists aldready

    const istransactionaldreadyExists = await transactionModel.findOne({
        idempotencyKey : idempotencyKey
    })

    if(istransactionaldreadyExists){
        if(istransactionaldreadyExists.status === "COMPLETED"){
            return res.status(200).json({
                message : "Transaction aldready processed"
            })
        }

        if(istransactionaldreadyExists.status === "PENDING"){
            return res.stauts(200).json({
                message : "Transaction in progress"
            })
        }

        if(istransactionaldreadyExists.status === "FAILED"){
            return res.status(500).json({
                message : "Transaction Pending"
            })
        }

        if(istransactionaldreadyExists.status === "REVERSED"){
            return res.status(500).json({
                message : "Transaction reversed , try again !"
            })
        }
    }

    // check the both from and to account are active
    
    if(fromuserAccount.status != "ACTIVE" && touserAccount.status != "ACTIVE"){
        return res.status(400).json({
            message : "Account are closed or fronzen"
        })
    }

    // derive sender balance from ledger

    const balance = await fromuserAccount.getBalance()

    if(balance < amount){
        return res.status(400).json({
            message : `Insuffcient balance , Current balance is ${balance}`
        })
    }

    // create transaction

    const session = await mongoose.startSession()
    session.startTransaction()

}