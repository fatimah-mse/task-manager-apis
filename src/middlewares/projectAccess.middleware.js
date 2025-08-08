const Task = require("../models/Task")
const mongoose = require("mongoose")
const Project = require("../models/Project")
const helpers = require("../helpers/helpers")

const filterProjectsByRole = async (req, res, next) => {
    const userId = req.user.id
    const userRole = req.user.role

    if (userRole === "admin") {
        req.projectFilter = {}
        return next()
    }

    try {
        const userTasks = await Task.find({ assignedTo: userId }).select("project")
        const projectIds = [...new Set(userTasks.map(task => task.project.toString()))]
        req.projectFilter = { _id: { $in: projectIds } }
        next()
    } catch (err) {
        return res.status(500).json(helpers.responseError(err.message))
    }
}

const canViewProjectById = async (req, res, next) => {
    const { id: projectId } = req.params
    const { id: userId, role: userRole } = req.user

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
        return res.status(400).json(helpers.responseError("Invalid Project ID"))
    }

    try {
        const project = await Project.findById(projectId)
        if (!project) {
            return res.status(404).json(helpers.responseError("Project not Founded"))
        }

        if (userRole !== "admin") {
            const hasAccess = await Task.exists({ project: projectId, assignedTo: userId })
            if (!hasAccess) {
                return res.status(403).json(helpers.responseError("You don't have access to this project"))
            }
        }

        req.project = project
        next()
    } catch (err) {
        return res.status(500).json(helpers.responseError(err.message))
    }
}

module.exports = {
    filterProjectsByRole,
    canViewProjectById
}
