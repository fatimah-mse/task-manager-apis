const User = require("../models/User")
const OTP = require("../models/OTP")
const argon2 = require("argon2")
const jwt = require("jsonwebtoken")
const helpers = require('../helpers/helpers')
const { sendOTPEmail } = require('../config/emails')

const generateToken = (data) => {
    return jwt.sign(data, process.env.JWT_SECRET_KEY)
}

class AuthController {

    signup = async (req, res) => {
        try {
            const { name, email, password } = req.body

            const hashedPassword = await argon2.hash(password)

            const user = await User.create({ name, email, password: hashedPassword })

            const token = generateToken({
                id: user._id,
                email: user.email,
                role: user.role
            })

            return res.status(200).json(helpers.responseSuccess("Signup Successfully", {
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email
                }
            }))
        } catch (err) {
            return res.status(500).json(helpers.responseError(err.message))
        }
    }

    login = async (req, res) => {
        try {
            const { email, password } = req.body

            const user = await User.findOne({ email })

            const isPasswordCorrect = await argon2.verify(user.password, password)
            if (!isPasswordCorrect) {
                return res.status(400).json(helpers.responseError("Email or password is incorrect"))
            }

            const token = generateToken({
                id: user._id,
                email: user.email,
                role: user.role
            })

            const description = user.role === "admin"
                ? `Manager logged in`
                : `User ${user.name} logged in`

            await helpers.logActivity({
                userId: user._id,
                type: 'login',
                description
            })

            return res.status(200).json(helpers.responseSuccess("Login Successfully", {
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            }))
        } catch (err) {
            return res.status(500).json(helpers.responseError(err.message))
        }
    }

    logout = async (req, res) => {
        try {
            const user = req.user
            if (!user) {
                return res.status(400).json(helpers.responseError("Unauthorized"))
            }

            return res.status(200).json(helpers.responseSuccess("Logged out Successfully"))
        } catch (error) {
            return res.status(500).json(helpers.responseError(error.message))
        }
    }

    sendOTP = async (req, res) => {
        try {
            const { email } = req.body

            const user = await User.findOne({ email })

            await OTP.deleteMany({ user: user._id })

            const key = helpers.generateOTP()

            await OTP.create({ user: user._id, password: key, secretKey: helpers.generateOTP() })

            await sendOTPEmail(email, key)

            // console.log(key)

            return res.status(200).json(helpers.responseSuccess("OTP sent Successfully"))
        } catch (error) {
            return res.status(500).json(helpers.responseError(error.message))
        }
    }

    checkOTP = async (req, res) => {
        try {
            const { otp, email } = req.body

            const user = await User.findOne({ email })

            if (!user) {
                return res.status(400).json(helpers.responseError("Invalid Email"))
            }

            const otp1 = await OTP.findOne({ user: user._id })

            if (!otp1) {
                return res.status(400).json(helpers.responseError("Does not have an OTP, You must request an OTP first"))
            }

            if (otp1.password !== otp) {
                return res.status(400).json(helpers.responseError("Invalid OTP"))
            }

            return res.status(200).json(helpers.responseSuccess("OTP verified Successfully",
                {
                    email: user.email,
                    secret: otp1.secretKey
                }
            ))

        } catch (error) {
            return res.status(500).json(helpers.responseError(error.message))
        }
    }

    updatePassword = async (req, res) => {
        try {
            const { password, email, secret } = req.body

            if (!secret) {
                return res.status(400).json(helpers.responseError("Invalid"))
            }

            const user = await User.findOne({ email })

            const verify = await OTP.findOne({ user: user._id, secretKey: secret })

            if (!verify) {
                return res.status(400).json(helpers.responseError("Invalid"))
            }

            const hashed = await helpers.hash(password)

            await User.findOneAndUpdate({ email }, { password: hashed })

            return res.status(200).json(helpers.responseSuccess("Password Updated Successfully"))
        } catch (error) {
            return res.status(500).json(helpers.responseError(error.message))
        }
    }
}

module.exports = new AuthController()