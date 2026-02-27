const transactionModel = require('../models/transaction.model')
const accountModel = require('../models/account.model')
const ledgerModel = require('../models/ledger.model')
const emailService = require('../services/email.service')
const mongoose = require('mongoose')


async function createTransaction(req,res){
    // check if all data recieved to create transaction

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
    let transaction;

    try{

    

    // create transaction

    const session = await mongoose.startSession()
    session.startTransaction()

    transaction = (await transactionModel.create([{
        fromAccount,
        toAccount,
        amount,
        idempotencyKey,
        status:"PENDING"
    }] , {session}))[ 0 ]

    const debitLedgerentry = await ledgerModel.create([{
        account : fromAccount,
        amount : amount,
        transaction : transaction._id,
        type : "DEBIT"
    }],{session})

    await (()=>{
        return new Promise((resolve) => setTimeout(resolve , 15 * 1000));
    })()

    const creditLedgerentry = await ledgerModel.create([{
        account : toAccount,
        amount : amount,
        transaction : transaction._id,
        type : "CREDIT"
    }],{session})

    await transactionModel.findOneAndUpdate(
        { _id: transaction._id },
        { $set: { status: "COMPLETED" } },
        { returnDocument: "after", session }
    )

    await transaction.save({session})

    await session.commitTransaction()
    session.endSession()
}catch(err){
    return res.status(400).json({
        message : "Transaction is Pending due to technical issue"
    })
}

    // send mail

    await emailService.sendTransactionEmail(req.user.email , req.user.name , amount , toAccount)

    return res.status(201).json({
        message : "Transaction completed successfullly",
        transaction : transaction
    })
}


async function createInitialfunds(req,res){
    const{toAccount,amount,idempotencyKey} = req.body

    if(!toAccount || !amount || !idempotencyKey){
        return res.status(400).json({
            message : "All data are required to transfer"
        })
    }

    const touserAccount = await accountModel.findOne({
        _id : toAccount
    })

    if(!touserAccount){
        return res.status(400).json({
            message : "Invalid account"
        })
    }

    const fromuserAccount = await accountModel.findOne({
        user : req.user._id
    })

    if(!fromuserAccount){
        return res.status(400).json({
            message : "System user account not found"
        })
    }

    const session = await mongoose.startSession()
    session.startTransaction()
    
    const transaction = new transactionModel({
        fromAccount : fromuserAccount._id,
        toAccount,
        amount,
        idempotencyKey,
        status : "PENDING"
    })

    const debitLedgerentry = await ledgerModel.create([{
        account : fromuserAccount._id,
        amount : amount,
        transaction : transaction._id,
        type : "DEBIT"
    }],{session})

    const creditLedgerentry = await ledgerModel.create([{
        account : toAccount,
        amount : amount,
        transaction : transaction._id,
        type : "CREDIT"
    }],{session})
    
    transaction.status = "COMPLETED"

    await transaction.save({session})

    await session.commitTransaction()
    session.endSession()

    return res.status(201).json({
        message : "Initial transaction completed successfullly",
        transaction : transaction
    })
}

module.exports = {
    createTransaction,
    createInitialfunds
}