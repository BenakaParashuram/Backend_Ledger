const express = require('express')
const authcontroller = require('../controllers/auth.controller')
const router = express.Router()

router.post("/register" , authcontroller.userRegisteredController)

router.post("/login" , authcontroller.userLoginController)

router.post("/logout",authcontroller.userLogoutController)

module.exports = router