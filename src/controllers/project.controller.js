const Project = require("../models/Project")
const Task = require("../models/Task")
const Note = require("../models/Note")
const mongoose = require('mongoose')
const helpers = require('../helpers/helpers')

class ProjectController {

    getProjects = async (req, res) => {
        try {
            const { search, fromDate, toDate } = req.query
            const query = { ...req.projectFilter }

            if (search) {
                query.name = { $regex: search, $options: 'i' }
            }

            if (fromDate || toDate) {
                query.startDate = {}
                if (fromDate) query.startDate.$gte = new Date(fromDate)
                if (toDate) query.startDate.$lte = new Date(toDate)
            }

            const projects = await Project.find(query)

            if (!projects.length) {
                return res.status(200).json(helpers.responseSuccess("No Projects Founded"))
            }

            return res.status(200).json(
                helpers.responseSuccess("Projects Fetched Successfully", projects)
            )
        } catch (err) {
            return res.status(500).json(helpers.responseError(err.message))
        }
    }

    getProjectById = async (req, res) => {
        try {

            const project = req.project

            return res.status(200).json(
                helpers.responseSuccess("Project Details Fetched Successfully", project)
            )
        } catch (err) {
            return res.status(500).json(helpers.responseError(err.message))
        }
    }

    getProjectStatus = async (req, res) => {
        try {
            const now = new Date()
            const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
            const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)

            const [notStarted, active, completed, delayed, completedMonth] = await Promise.all([
                Project.countDocuments({
                    startDate: { $gt: now }
                }),

                Project.countDocuments({
                    startDate: { $lte: now },
                    $or: [
                        { $expr: { $lt: ["$completedTasks", "$totalTasks"] } },
                        { totalTasks: 0 }
                    ],
                    endDate: { $gte: now }
                }),

                Project.countDocuments({
                    $expr: { $eq: ["$completedTasks", "$totalTasks"] },
                    totalTasks: { $gt: 0 }
                }),

                Project.countDocuments({
                    startDate: { $lte: now },
                    $or: [
                        { $expr: { $lt: ["$completedTasks", "$totalTasks"] } },
                        { totalTasks: 0 }
                    ],
                    endDate: { $lt: now }
                }),

                Project.countDocuments({
                    $expr: { $eq: ["$completedTasks", "$totalTasks"] },
                    totalTasks: { $gt: 0 },
                    updatedAt: { $gte: firstDay, $lte: lastDay }
                })
            ])

            return res.status(200).json(
                helpers.responseSuccess("Project Status Fetched Successfully", {
                    notStarted,
                    active,
                    completed,
                    delayed,
                    completedThisMonth: completedMonth
                })
            )
        } catch (err) {
            return res.status(500).json(helpers.responseError(err.message))
        }
    }

    createProject = async (req, res) => {
        try {
            const { name, description, startDate, endDate } = req.body

            const project = await Project.create({
                name: name,
                description: description,
                startDate: new Date(startDate),
                endDate: new Date(endDate)
            })

            await helpers.logActivity({
                userId: req.user.id,
                type: "create project",
                description: `Manager created project "${project.name}"`,
                project: project._id.toString()
            })

            return res.status(200).json(helpers.responseSuccess("Project Created Successfully", project))
        } catch (err) {
            return res.status(500).json(helpers.responseError(err.message))
        }
    }

    updateProject = async (req, res) => {
        try {
            const { id } = req.params
            const { name, description, startDate, endDate } = req.body

            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json(helpers.responseError("Invalid project ID"))
            }

            const project = await Project.findById(id)
            if (!project) {
                return res.status(404).json(helpers.responseError("Project not Founded"))
            }

            const trimmedName = name
            const trimmedDescription = description
            const newStartDate = startDate ? new Date(startDate) : null
            const newEndDate = endDate ? new Date(endDate) : null

            const isNameChanged = trimmedName && trimmedName !== project.name
            const isDescriptionChanged = trimmedDescription && trimmedDescription !== project.description
            const isStartDateChanged = newStartDate && newStartDate.getTime() !== project.startDate.getTime()
            const isEndDateChanged = newEndDate && newEndDate.getTime() !== project.endDate.getTime()

            if (
                !isNameChanged &&
                !isDescriptionChanged &&
                !isStartDateChanged &&
                !isEndDateChanged
            ) {
                return res.status(200).json(helpers.responseSuccess("No changes made, Data is the same", project))
            }

            if (isNameChanged) project.name = trimmedName
            if (isDescriptionChanged) project.description = trimmedDescription
            if (isStartDateChanged) project.startDate = newStartDate
            if (isEndDateChanged) project.endDate = newEndDate

            await project.save()

            const updatedProject = await Project.findById(id)

            return res.status(200).json(helpers.responseSuccess("Project Updated Successfully", updatedProject))
        } catch (err) {
            return res.status(500).json(helpers.responseError(err.message))
        }
    }

    deleteProject = async (req, res) => {
        try {
            const { id } = req.params

            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json(helpers.responseError("Invalid project ID"))
            }

            const project = await Project.findById(id)
            if (!project) {
                return res.status(404).json(helpers.responseError("Project not Founded"))
            }

            const tasks = await Task.find({ project: id })
            const taskIds = tasks.map(task => task._id)
            await Note.deleteMany({ task: { $in: taskIds } })

            await Task.deleteMany({ project: id })

            await Project.findByIdAndDelete(id)

            return res.status(200).json(helpers.responseSuccess("Project Deleted Successfully"))
        } catch (err) {
            return res.status(500).json(helpers.responseError(err.message))
        }
    }

}

module.exports = new ProjectController()