const { default: mongoose, Schema } = require("mongoose")

const noteSchema = new Schema({
    task: {
        type: Schema.Types.ObjectId,
        ref: "Task",
        required: true
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    content: {
        type: String,
        required: true,
        trim: true
    }
}, { timestamps: true })

const Note = mongoose.model("Note", noteSchema)

module.exports = Note