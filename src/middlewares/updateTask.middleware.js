const Task = require("../models/Task")
const helpers = require('../helpers/helpers')

const canEditTask = async (req, res, next) => {

    const taskId = req.params.id
    const user = req.user

    const task = await Task.findById(taskId).populate("project", "name")
    if (!task) {
        return res.status(404).json(helpers.responseError("Task not Founded"))
    }

    req.task = task

    if (user.role === "admin") return next()

    if (user.role === "user") {
        const isAssigned = String(task.assignedTo) === user.id
        if (!isAssigned) {
            return res.status(403).json(helpers.responseError("You can only edit tasks assigned to you"))
        }

        const allowedFields = ["status"]
        const keys = Object.keys(req.body)
        const invalidFields = keys.filter(k => !allowedFields.includes(k))

        if (invalidFields.length > 0) {
            return res.status(403).json(helpers.responseError("You are only allowed to update the task status"))
        }

        return next()
    }

    return res.status(403).json(helpers.responseError("Access denied"))
}

module.exports = canEditTask