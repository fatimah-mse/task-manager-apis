const { body } = require("express-validator")
const validate = require("../middlewares/validate.middleware")

const addTaskValidate = [
    body("title")
        .trim()
        .isString().withMessage("Task title must be a string")
        .bail()
        .notEmpty().withMessage("Task title is required")
        .bail(),

    body("description")
        .trim()
        .isString().withMessage("Description must be a string")
        .bail()
        .notEmpty().withMessage("Task description is required")
        .bail(),

    body("dueDate")
        .notEmpty().withMessage("Due date is required")
        .bail()
        .isISO8601().withMessage("Due date must be a valid date")
        .bail()
        .custom((value) => {
            const today = new Date()
            today.setHours(0, 0, 0, 0)
            const inputDate = new Date(value)
            
            if (inputDate < today) {
                throw new Error("Due date cannot be in the past")
            }
            return true
        })
        .bail(),

    body("priority")
        .optional()
        .isIn(["low", "medium", "high", "urgent"]).withMessage("Priority must be one of: low, medium, high, urgent")
        .bail(),

    body("status")
        .optional()
        .isIn(["pending", "in progress", "completed", "postponed"]).withMessage("Status must be one of: pending, in progress, completed, postponed")
        .bail(),

    body("assignedTo")
        .notEmpty().withMessage("Assigned user is required")
        .bail()
        .isMongoId().withMessage("Assigned user must be a valid ID")
        .bail(),

    body("project")
        .notEmpty().withMessage("Project ID is required")
        .bail()
        .isMongoId().withMessage("Project ID must be a valid ID")
        .bail(),

    validate
]

const updateTaskValidate = [
    body("title")
        .optional()
        .trim()
        .isString().withMessage("Task title must be a string")
        .bail()
        .notEmpty().withMessage("Task title is required")
        .bail(),

    body("description")
        .optional()
        .trim()
        .isString().withMessage("Description must be a string")
        .bail()
        .notEmpty().withMessage("Task description is required")
        .bail(),

    body("dueDate")
        .optional()
        .notEmpty().withMessage("Due date is required")
        .bail()
        .isISO8601().withMessage("Due date must be a valid date")
        .bail()
        .custom((value) => {
            const today = new Date()
            today.setHours(0, 0, 0, 0)
            const inputDate = new Date(value)
            
            if (inputDate < today) {
                throw new Error("Due date cannot be in the past")
            }
            return true
        })
        .bail(),

    body("priority")
        .optional()
        .isIn(["low", "medium", "high", "urgent"]).withMessage("Priority must be one of: low, medium, high, urgent")
        .bail(),

    body("status")
        .optional()
        .isIn(["pending", "in progress", "completed", "postponed"]).withMessage("Status must be one of: pending, in progress, completed, postponed")
        .bail(),

    body("assignedTo")
        .optional()
        .notEmpty().withMessage("Assigned user is required")
        .bail()
        .isMongoId().withMessage("Assigned user must be a valid ID")
        .bail(),

    body("project")
        .optional()
        .notEmpty().withMessage("Project ID is required")
        .bail()
        .isMongoId().withMessage("Project ID must be a valid ID")
        .bail(),

    validate
]

module.exports = {
    addTaskValidate,
    updateTaskValidate
}
