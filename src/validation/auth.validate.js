const { body } = require("express-validator")
const User = require("../models/User")
const validate = require("../middlewares/validate.middleware")

const signupValidate = [
    body("name")
        .trim()
        .isString().withMessage("Name must be string")
        .bail()
        .notEmpty().withMessage("Name is required")
        .bail(),

    body("email")
        .trim()
        .isString().withMessage("Email must be string")
        .bail()
        .notEmpty().withMessage("Email is required")
        .bail()
        .isEmail().withMessage("Invalid Email Format")
        .bail()
        .custom(async (value) => {
            const isEmail = await User.findOne({ email: value })
            if (isEmail) {
                throw new Error("Your email already exists")
            }
            return true
        })
        .bail(),

    body("password")
        .trim()
        .notEmpty().withMessage("Password is required")
        .bail()
        .isString().withMessage("Password must be string")
        .bail()
        .isLength({ min: 8 }).withMessage("Password must be at least 8 characters")
        .bail()
        .isStrongPassword().withMessage(`Password must include at least:
            - 1 uppercase letter
            - 1 lowercase letter
            - 1 number
            - 1 special character`)
        .bail(),

    validate
]

const loginValidate = [
    body("email")
        .trim()
        .notEmpty().withMessage("Email is required")
        .bail()
        .isString().withMessage("Email must be string")
        .bail()
        .custom(async (value) => {
            const isEmail = await User.findOne({ email: value })
            if (!isEmail) {
                throw new Error("Email does not exists")
            }
            return true
        })
        .bail()
        .isEmail().withMessage("Invalid Email Format")
        .bail(),

    body("password")
        .trim()
        .notEmpty().withMessage("Password is required")
        .bail()
        .isString().withMessage("Password must be string")
        .bail(),

    validate
]

const sendEmailValidate = [
    body("email")
        .trim()
        .notEmpty().withMessage("Email is required")
        .bail()
        .isString().withMessage("Email must be string")
        .bail()
        .isEmail().withMessage("Invalid Email Format")
        .bail()
        .custom(async (value) => {
            const isEmail = await User.findOne({ email: value })
            if (!isEmail) {
                throw new Error("Email does not exists")
            }
            return true
        })
        .bail(),

    validate
]

const updatePasswordValidate = [
    body("email")
        .trim()
        .notEmpty().withMessage("Email is required")
        .bail()
        .isString().withMessage("Email must be string")
        .bail()
        .isEmail().withMessage("Invalid Email Format")
        .custom(async (value) => {
            const isEmail = await User.findOne({ email: value })

            if (!isEmail) {
                throw new Error("Email does not exists")
            }

            return true;
        }).bail(),

    body("password")
        .trim()
        .notEmpty().withMessage("Password is required")
        .bail()
        .isString().withMessage("Password must be string")
        .bail()
        .isLength({ min: 8 }).withMessage("Password must be at least 8 characters")
        .bail()
        .isStrongPassword().withMessage(`Password must include at least:
            - 1 uppercase letter
            - 1 lowercase letter
            - 1 number
            - 1 special character`)
        .bail(),

    validate
]

module.exports = {
    signupValidate,
    loginValidate,
    sendEmailValidate,
    updatePasswordValidate
}
