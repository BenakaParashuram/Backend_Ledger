const express = require('express')
const Router = express.Router()
const authMiddleware = require('../middlewares/auth.middleware')
const transactionController = require('../controllers/transaction.controller')

Router.post('/' , authMiddleware.authMiddleware , )