const express = require("express")
const router = express.Router()
const authController = require("../controllers/auth.controller")
const auth = require("../middlewares/auth.middleware")
const { signupValidate, loginValidate, sendEmailValidate, updatePasswordValidate } = require("../validation/auth.validate")

router.post("/signup", [...signupValidate], authController.signup)
router.post("/login", [...loginValidate], authController.login)
router.post("/logout", [auth], authController.logout)
router.post("/send-otp", [...sendEmailValidate], authController.sendOTP)
router.post("/check-otp", authController.checkOTP)
router.put("/update-password", [...updatePasswordValidate], authController.updatePassword)

module.exports = router