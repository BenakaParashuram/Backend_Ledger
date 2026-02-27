const express = require('express')
const Router = express.Router()
const authMiddleware = require('../middlewares/auth.middleware')
const transactionController = require('../controllers/transaction.controller')

Router.post('/' , authMiddleware.authMiddleware , transactionController.createTransaction)


Router.post('/system/initial-funds' , authMiddleware.authSystemuserMiddleware , transactionController.createInitialfunds)


module.exports= Router