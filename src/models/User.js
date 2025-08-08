require('dotenv').config()
const { default: mongoose } = require("mongoose")
const helpers = require("../helpers/helpers")

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: true
    },
    email: { 
        type: String, 
        trim: true,
        unique: true, 
        required: true 
    },
    password: {
        type: String,
        required: true
    },
    role: { 
        type: String, 
        enum: ['user', 'admin'], 
        default: 'user' 
    }
}, {
    timestamps: true
})

const User = mongoose.model("User", userSchema)

const email = process.env.ADMIN_EMAIL
const password = process.env.ADMIN_PASSWORD

helpers.createAdmin(User, email, password)
    .then(e => {
        console.log("Admin is created")
    })
    .catch(err => {
        console.log(err.message)
    })

module.exports = User