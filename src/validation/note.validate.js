const { body } = require("express-validator")
const validate = require("../middlewares/validate.middleware")

const noteValidate = [
    body("content")
        .trim()
        .isString().withMessage("Note content must be a string")
        .bail()
        .notEmpty().withMessage("Note content is required")
        .bail(),

    validate
]

module.exports = {
    noteValidate
}