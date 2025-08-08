const Task = require("../models/Task")
const Note = require("../models/Note")
const mongoose = require('mongoose')
const helpers = require("../helpers/helpers")

const canCreateNoteOnTask = async (req, res, next) => {
    const taskId = req.body.task || req.params.taskId
    const userId = req.user.id
    const userRole = req.user.role

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
        return res.status(400).json(helpers.responseError("Task is required"))
    }

    try {
        const task = await Task.findById(taskId).populate("assignedTo", "_id")
        if (!task) {
            return res.status(404).json(helpers.responseError("Task not Founded"))
        }

        if (userRole !== "admin" && String(task.assignedTo._id) !== userId) {
            return res.status(403).json(helpers.responseError("You can't add a note to this task"))
        }

        req.task = task
        next()
    } catch (err) {
        return res.status(500).json(helpers.responseError(err.message))
    }
}

const canModifyNote = async (req, res, next) => {
    const { id } = req.params
    const userId = req.user.id

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json(helpers.responseError("Invalid Note ID"))
    }

    try {
        const note = await Note.findById(id).populate("author", "role")
        if (!note) {
            return res.status(404).json(helpers.responseError("Note not Founded"))
        }

        if (String(note.author._id) === userId) {
            req.note = note
            return next()
        }

        return res.status(403).json(helpers.responseError("You don't have permission to modify this note"))
    } catch (err) {
        return res.status(500).json(helpers.responseError(err.message))
    }
}

module.exports = {
    canCreateNoteOnTask,
    canModifyNote
}