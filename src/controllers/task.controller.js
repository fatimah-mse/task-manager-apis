require('dotenv').config()
const Project = require("../models/Project")
const Task = require("../models/Task")
const User = require('../models/User')
const Note = require('../models/Note')
const mongoose = require('mongoose')
const helpers = require('../helpers/helpers')
const socket = require('../socket')
const { sendNotificationEmail } = require('../config/emails')
const EMAIL = process.env.ADMIN_EMAIL

class TaskController {

    getTasks = async (req, res) => {
        try {
            const { status, project, assignedTo, dueDate } = req.query
            const filter = { ...req.taskFilter }

            if (status) filter.status = status

            if (dueDate) {
                const date = new Date(dueDate)
                date.setHours(0, 0, 0, 0)

                const nextDay = new Date(date)
                nextDay.setDate(nextDay.getDate() + 1)

                filter.dueDate = {
                    $gte: date,
                    $lt: nextDay
                }
            }

            let tasks = await Task.find(filter)
                .populate({
                    path: "project",
                    select: "name",
                    match: project ? {
                        $or: [
                            { _id: mongoose.Types.ObjectId.isValid(project) ? project : undefined },
                            { name: new RegExp(project, "i") }
                        ]
                    } : {}
                })
                .populate({
                    path: "assignedTo",
                    select: "name email",
                    match: assignedTo ? {
                        $or: [
                            { _id: mongoose.Types.ObjectId.isValid(assignedTo) ? assignedTo : undefined },
                            { name: new RegExp(assignedTo, "i") }
                        ]
                    } : {}
                })

            tasks = tasks.filter(task => task.project && task.assignedTo)

            if (!tasks.length) {
                return res.status(200).json(helpers.responseSuccess("No Tasks Founded"))
            }

            return res.status(200).json(
                helpers.responseSuccess("Tasks Fetched Successfully", tasks)
            )

        } catch (err) {
            return res.status(500).json(helpers.responseError(err.message))
        }
    }

    getTaskById = async (req, res) => {
        try {
            const task = req.task

            return res.status(200).json(
                helpers.responseSuccess("Task Details Fetched Successfully", task)
            )
        } catch (err) {
            return res.status(500).json(helpers.responseError(err.message))
        }
    }

    getTaskStatus = async (req, res) => {
        try {
            const now = new Date()
            const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
            const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)

            const [notStarted, active, delayed, completedMonth] = await Promise.all([
                Task.countDocuments({
                    createdAt: { $gt: now }
                }),

                Task.countDocuments({
                    createdAt: { $lte: now },
                    status: { $ne: "completed" },
                    dueDate: { $gte: now }
                }),

                Task.countDocuments({
                    createdAt: { $lte: now },
                    status: { $ne: "completed" },
                    dueDate: { $lt: now }
                }),

                Task.countDocuments({
                    status: "completed",
                    updatedAt: { $gte: firstDay, $lte: lastDay }
                })
            ])

            return res.status(200).json(
                helpers.responseSuccess("Task Status Fetched Successfully", {
                    notStarted,
                    active,
                    delayed,
                    completedThisMonth: completedMonth
                })
            )
        } catch (err) {
            return res.status(500).json(helpers.responseError(err.message))
        }
    }

    createTask = async (req, res) => {
        try {
            const { title, description, dueDate, priority, status, assignedTo, project } = req.body

            const existingProject = await Project.findById(project)
            if (!existingProject) {
                return res.status(404).json(helpers.responseError("Project not Founded"))
            }

            const assignedUser = await User.findById(assignedTo)

            if (!assignedUser) {
                return res.status(404).json(helpers.responseError('Assigned user not found'))
            }

            const newTask = await Task.create({
                title,
                description,
                dueDate,
                priority,
                status,
                assignedTo,
                project
            })

            await Project.findByIdAndUpdate(project, {
                $inc: {
                    totalTasks: 1,
                    completedTasks: status === 'completed' ? 1 : 0
                }
            })

            const userEmail = assignedUser.email

            sendNotificationEmail(userEmail, `You have been assigned a new task: "${title}"`)

            const io = socket.getIO()
            const onlineUsers = socket.onlineUsers

            const targetSocketId = onlineUsers.get(assignedTo)
            if (targetSocketId) {
                console.log(`You have been assigned a new task: "${title}"`)
                io.to(targetSocketId).emit("notification", `You have been assigned a new task: "${title}"`)
            }

            return res.status(200).json(
                helpers.responseSuccess("Task Created Successfully", newTask)
            )

        } catch (err) {
            return res.status(500).json(helpers.responseError(err.message))
        }
    }

    updateTask = async (req, res) => {
        try {
            const { id } = req.params
            const {
                title,
                description,
                dueDate,
                priority,
                status,
                assignedTo,
                project
            } = req.body

            const task = req.task
            const isAdmin = req.user.role === 'admin'
            const isUser = req.user.role === 'user'

            const updates = {}
            const prevStatus = task.status

            if (isAdmin) {
                if (title && title !== task.title) updates.title = title
                if (description && description !== task.description) updates.description = description
                if (dueDate && new Date(dueDate).toISOString() !== task.dueDate.toISOString()) updates.dueDate = dueDate
                if (priority && priority !== task.priority) updates.priority = priority
                if (status && status !== task.status) updates.status = status
                if (assignedTo && assignedTo !== String(task.assignedTo)) updates.assignedTo = assignedTo
                if (project && project !== String(task.project)) updates.project = project
            }

            if (isUser) {
                if (status && status !== task.status) {
                    updates.status = status
                } else {
                    return res.status(200).json(
                        helpers.responseSuccess("No changes made, data is the same")
                    )
                }
            }

            if (Object.keys(updates).length === 0) {
                return res.status(200).json(helpers.responseSuccess("No changes made, data is the same"))
            }

            const updatedTask = await Task.findByIdAndUpdate(id, updates, { new: true })

            if (updates.status && updates.status !== prevStatus) {
                if (prevStatus !== 'completed' && updates.status === 'completed') {
                    await Project.findByIdAndUpdate(task.project._id, { $inc: { completedTasks: 1 } })
                } else if (prevStatus === 'completed' && updates.status !== 'completed') {
                    await Project.findByIdAndUpdate(task.project._id, { $inc: { completedTasks: -1 } })
                }

                const io = socket.getIO()
                const onlineUsers = socket.onlineUsers

                for (const [userId, socketId] of onlineUsers.entries()) {
                    const adminUser = await User.findById(userId)
                    if (adminUser && adminUser.role === 'admin') {
                        io.to(socketId).emit(
                            "notification",
                            `Status of task "${task.title}" changed to "${updates.status}" by ${req.user.name}`
                        )
                    }
                }
            }

            sendNotificationEmail(EMAIL, `Status of task "${task.title}" changed to "${updates.status}" by ${req.user.name}`)

            const desc = req.user.role === "admin"
                ? `Manager updated task "${task.title}" in "${task.project.name}" project`
                : `${req.user.name} updated task "${task.title}" status`

            await helpers.logActivity({
                userId: req.user.id,
                type: "update task",
                description: desc,
                project: task.project,
                task: task._id
            })

            return res.status(200).json(
                helpers.responseSuccess("Task Updated Successfully", updatedTask)
            )

        } catch (err) {
            return res.status(500).json(helpers.responseError(err.message))
        }
    }

    deleteTask = async (req, res) => {
        try {
            const { id } = req.params

            const task = await Task.findById(id).populate("project", "name")

            if (!task) {
                return res.status(404).json(helpers.responseError("Task not Founded"))
            }

            await Note.deleteMany({ task: task._id })

            await Task.findByIdAndDelete(id)

            await Project.findByIdAndUpdate(task.project._id, {
                $inc: {
                    totalTasks: -1,
                    completedTasks: task.status === 'completed' ? -1 : 0
                }
            })

            return res.status(200).json(
                helpers.responseSuccess("Task Deleted Successfully")
            )

        } catch (err) {
            return res.status(500).json(helpers.responseError(err.message))
        }
    }

}

module.exports = new TaskController()