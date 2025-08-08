const { body } = require("express-validator")
const validate = require("../middlewares/validate.middleware")

const addProjectValidate = [
    body("name")
        .trim()
        .isString().withMessage("Project name must be a string")
        .bail()
        .notEmpty().withMessage("Project name is required")
        .bail(),

    body("description")
        .trim()
        .isString().withMessage("Description must be a string")
        .bail()
        .notEmpty().withMessage("Project description is required")
        .bail(),

    body("startDate")
        .notEmpty().withMessage("Start date is required")
        .bail()
        .isISO8601().withMessage("Start date must be a valid date")
        .bail()
        .custom((value) => {
            const today = new Date()
            today.setHours(0, 0, 0, 0)
            const inputDate = new Date(value)
            
            if (inputDate < today) {
                throw new Error("Start date cannot be in the past")
            }
            return true
        })
        .bail(),

    body("endDate")
        .notEmpty().withMessage("End date is required")
        .bail()
        .isISO8601().withMessage("End date must be a valid date")
        .bail()
        .custom((value, { req }) => {
            if (new Date(value) <= new Date(req.body.startDate)) {
                throw new Error("End date must be after start date")
            }
            return true
        })
        .bail(),

    validate
]

const updateProjectValidate = [
    body("name")
        .optional()
        .trim()
        .isString().withMessage("Project name must be a string")
        .bail()
        .notEmpty().withMessage("Project name is required")
        .bail(),

    body("description")
        .optional()
        .trim()
        .isString().withMessage("Description must be a string")
        .bail()
        .notEmpty().withMessage("Project description is required")
        .bail(),

    body("startDate")
        .optional()
        .custom((value) => {
            const today = new Date()
            today.setHours(0, 0, 0, 0)
            const inputDate = new Date(value)
            
            if (inputDate < today) {
                throw new Error("Start date cannot be in the past")
            }
            return true
        })
        .bail(),

    body("endDate")
        .optional()
        .custom((value, { req }) => {
            if (new Date(value) <= new Date(req.body.startDate)) {
                throw new Error("End date must be after start date")
            }
            return true
        })
        .bail(),

    validate
]

module.exports = {
    addProjectValidate,
    updateProjectValidate
}
