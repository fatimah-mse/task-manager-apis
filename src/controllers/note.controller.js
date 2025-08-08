require('dotenv').config()
const Note = require('../models/Note')
const User = require('../models/User')
const helpers = require('../helpers/helpers')
const socket = require('../socket')
const { sendNotificationEmail } = require('../config/emails')
const EMAIL = process.env.ADMIN_EMAIL

class NoteController {

    getAllNotes = async (req, res) => {
        try {
            const baseFilter = req.notesFilter ?? {}
            const filter = { ...baseFilter }

            const sortOrder = req.query.sort === "desc" ? -1 : 1

            const notes = await Note.find(filter)
                .populate('task', 'title')
                .populate('author', 'name')
                .sort({ createdAt: sortOrder })

            if (!notes.length) {
                return res.status(200).json(helpers.responseSuccess("No Notes Founded"))
            }

            res.status(200).json(helpers.responseSuccess("Notes Fetched Successfully", notes))
        } catch (err) {
            res.status(500).json(helpers.responseError(err.message))
        }
    }

    getNotesByTask = async (req, res) => {
        try {
            const { taskId } = req.params

            const sortOrder = req.query.sort === "desc" ? -1 : 1

            const notes = await Note.find({ task: taskId })
                .populate('task', 'title')
                .populate('author', 'name')
                .sort({ createdAt: sortOrder })

            if (!notes.length) {
                return res.status(200).json(helpers.responseSuccess("No Notes for this Task"))
            }

            res.status(200).json(helpers.responseSuccess("Notes for Task Fetched Successfully", notes))
        } catch (err) {
            res.status(500).json(helpers.responseError(err.message))
        }
    }

    getNoteById = async (req, res) => {
        try {
            const { id } = req.params

            const note = await Note.findById(id)
                .populate('task', 'title')
                .populate('author', 'name')

            if (!note) {
                return res.status(404).json(helpers.responseError("Note not found"))
            }

            res.status(200).json(helpers.responseSuccess("Note fetched successfully", note))
        } catch (err) {
            res.status(500).json(helpers.responseError(err.message))
        }
    }

    createNote = async (req, res) => {
        try {
            const { content } = req.body

            const noteData = {
                task: req.task._id,
                author: req.user.id,
                content: content.trim()
            }

            const note = new Note(noteData)
            await note.save()

            const populated = await Note.findById(note._id)
                .populate("task", "title")
                .populate("author", "name")

            const desc = req.user.role === "admin"
                ? `Manager added a note to task "${req.task.title}"`
                : `${req.user.name} added a note to task "${req.task.title}"`
            await helpers.logActivity({
                userId: req.user.id,
                type: "add note",
                description: desc,
                task: req.task._id,
                note: note._id
            })

            const io = socket.getIO()
            const onlineUsers = socket.onlineUsers

            for (const [userId, socketId] of onlineUsers.entries()) {
                const adminUser = await User.findById(userId)
                if (adminUser && adminUser.role === 'admin') {
                    console.log(`New note added to task "${populated.task.title}" by ${req.user.name}`)
                    io.to(socketId).emit(
                        "notification",
                        `New note added to task "${populated.task.title}" by ${req.user.name}`
                    )
                }
            }

            sendNotificationEmail(EMAIL, `New note added to task "${populated.task.title}" by ${req.user.name}`)

            res.status(200).json(helpers.responseSuccess("Note created successfully", populated))
        } catch (err) {
            console.error("createNote error:", err)
            res.status(500).json(helpers.responseError(err.message))
        }
    }

    updateNote = async (req, res) => {
        try {
            const note = req.note
            const { content } = req.body

            if (note.content === content) {
                return res.status(200).json(helpers.responseSuccess("No changes made, Data is the same", note))
            }

            note.content = content

            await note.save()

            return res.status(200).json(helpers.responseSuccess("Note updated successfully", note))
        } catch (err) {
            return res.status(500).json(helpers.responseError(err.message))
        }
    }

    deleteNote = async (req, res) => {
        try {
            const { id } = req.params

            await Note.findByIdAndDelete(id)

            return res.status(200).json(helpers.responseSuccess("Note deleted successfully"))
        } catch (err) {
            return res.status(500).json(helpers.responseError(err.message))
        }
    }

}

module.exports = new NoteController()