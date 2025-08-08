const Task = require("../models/Task")
const helpers = require("../helpers/helpers")

const filterTasksByRole = (req, res, next) => {
    const userId = req.user.id
    const userRole = req.user.role

    req.taskFilter = {}

    if (userRole !== "admin") {
        req.taskFilter.assignedTo = userId
    }

    next()
}

const canViewTaskById = async (req, res, next) => {
    const taskId = req.params.id
    const userId = req.user.id
    const userRole = req.user.role

    try {
        const task = await Task.findById(taskId)
            .populate("project", "name")
            .populate("assignedTo", "name email")

        if (!task) {
            return res.status(404).json(helpers.responseError("Task not Founded"))
        }

        if (userRole !== "admin" && String(task.assignedTo._id) !== userId) {
            return res.status(403).json(helpers.responseError("You don't have access to this task"))
        }

        req.task = task
        next()
    } catch (err) {
        return res.status(500).json(helpers.responseError(err.message))
    }
}

module.exports = {
    filterTasksByRole,
    canViewTaskById
}
