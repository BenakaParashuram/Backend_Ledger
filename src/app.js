const express = require('express')
const cookieparser = require('cookie-parser')
const authRouter = require('./routes/auth.routes')
const accRouter = require('./routes/account.routes')
const transactionRouter = require('./routes/transaction.routes')


const app = express()

app.use(express.json())
app.use(cookieparser())

app.use("/api/auth" , authRouter)
app.use("/api/accounts" , accRouter)
app.use("/api/transaction" , transactionRouter)

module.exports = app