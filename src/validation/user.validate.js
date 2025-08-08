const { body } = require("express-validator")
const User = require("../models/User")
const validate = require("../middlewares/validate.middleware")

const updateMeValidate = [
    body("name")
        .optional()
        .trim()
        .isString().withMessage("Name must be a string")
        .bail()
        .notEmpty().withMessage("Name cannot be empty")
        .bail(),

    body("email")
        .optional()
        .trim()
        .isString().withMessage("Email must be a string")
        .bail()
        .notEmpty().withMessage("Email cannot be empty")
        .bail()
        .isEmail().withMessage("Invalid Email Format")
        .bail()
        .custom(async (value, { req }) => {
            const existingUser = await User.findOne({ email: value })

            if (existingUser && existingUser._id.toString() !== req.user.id) {
                throw new Error("This email is already taken")

            }
            return true

        })
        .bail(),

    body("password")
        .optional()
        .trim()
        .custom((value) => {
            if (!value) return true

            if (value.length < 8) {
                throw new Error("Password must be at least 8 characters")
            }

            const strong = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/
            if (!strong.test(value)) {
                throw new Error(`Password must include at least:
        - 1 uppercase letter
        - 1 lowercase letter
        - 1 number
        - 1 special character`)
            }

            return true
        })
        .bail(),


    body("oldPassword")
        .custom((value, { req }) => {
            const { name, email, password } = req.body

            const wantsToUpdate = !!name || !!email || !!password

            if (wantsToUpdate && (!value || value.trim() === "")) {
                throw new Error("Old password is required to update your profile")
            }

            return true
        }),

    validate
]


module.exports = {
    updateMeValidate
}