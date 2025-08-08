const mongoose = require('mongoose')
const Note = require("../models/Note")
const Task = require("../models/Task")
const helpers = require("../helpers/helpers")


const filterNotesByRole = (req, res, next) => {
    const userId = req.user.id
    const userRole = req.user.role

    if (userRole === "admin") {
        req.notesFilter = {}
        return next()
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json(helpers.responseError("Invalid User ID"))
    }

    req.notesFilter = { author: userId }
    next()
}

const canAccessTaskNotes = async (req, res, next) => {
    const { taskId } = req.params
    const userId = req.user.id
    const userRole = req.user.role

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
        return res.status(400).json(helpers.responseError("Invalid Task ID"))
    }

    try {
        const task = await Task.findById(taskId)
            .populate("project", "name")
            .populate("assignedTo", "name email")

        if (!task) {
            return res.status(404).json(helpers.responseError("Task not Founded"))
        }

        if (userRole !== "admin" && String(task.assignedTo._id) !== userId) {
            return res.status(403).json(helpers.responseError("You don't have access to this task's notes"))
        }

        req.task = task
        next()
    } catch (err) {
        return res.status(500).json(helpers.responseError(err.message))
    }
}

const canViewNoteById = async (req, res, next) => {
    const { id } = req.params
    const userId = req.user.id
    const userRole = req.user.role

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json(helpers.responseError("Invalid Note ID"))
    }

    try {
        const note = await Note.findById(id)
            .populate("author", "name role")
            .populate({
                path: "task",
                populate: { path: "assignedTo", select: "_id name email" }
            })

        if (!note) {
            return res.status(404).json(helpers.responseError("Note not Founded"))
        }

        if (!note.task) {
            return res.status(404).json(helpers.responseError("Task not found for this note"))
        }

        if (userRole === "admin") {
            req.note = note
            return next()
        }

        const isAuthor = String(note.author._id) === userId
        const taskAssignedToId = note.task?.assignedTo?._id?.toString()
        const isOnMyTask = taskAssignedToId === userId
        const authorIsAdmin = note.author.role === "admin"

        if (isAuthor || (isOnMyTask && authorIsAdmin)) {
            req.note = note
            return next()
        }

        return res.status(403).json(helpers.responseError("You don't have access to this note"))
    } catch (err) {
        console.error("Error in canViewNoteById:", err)
        return res.status(500).json(helpers.responseError(err.message))
    }
}

module.exports = {
    filterNotesByRole,
    canAccessTaskNotes,
    canViewNoteById
}