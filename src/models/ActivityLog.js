const { default: mongoose, Schema } = require("mongoose")

const ActivityLog = mongoose.model("ActivityLog", new mongoose.Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: [ "login", "create project", "update task", "add note" ]
    },
    description: {
        type: String,
        required: true
    },
    project: {
        type: Schema.Types.ObjectId,
        ref: "Project",
        default: null,
    },
    task: {
        type: Schema.Types.ObjectId,
        ref: "Task",
        default: null,
    },
    note: {
        type: Schema.Types.ObjectId,
        ref: "Note",
        default: null,
    },
}, {
    timestamps: true
}))

module.exports = ActivityLog