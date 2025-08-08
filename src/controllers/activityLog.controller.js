const ActivityLog = require("../models/ActivityLog")
const helpers = require("../helpers/helpers")

class ActivityLogController {
    getActivityLogs = async (req, res) => {
        try {
            const { project, task, note, user, type } = req.query

            const filter = {}

            if (project) filter.project = project
            if (task) filter.task = task
            if (note) filter.note = note
            if (user) filter.user = user
            if (type) filter.type = type.toUpperCase() 

            const logs = await ActivityLog.find(filter)
                .sort({ createdAt: -1 })
                .populate("user", "name email")
                .populate("project", "name")
                .populate("task", "title")
                .populate("note", "content")

            return res.status(200).json(
                helpers.responseSuccess("Activity logs fetched successfully", logs)
            )
        } catch (error) {
            return res.status(500).json(helpers.responseError(error.message))
        }
    }
}

module.exports = new ActivityLogController()