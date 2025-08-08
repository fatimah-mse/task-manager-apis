const User = require("../models/User")
const Note = require("../models/Note")
const Message = require("../models/Message")
const ActivityLog = require("../models/ActivityLog")
const argon2 = require("argon2")
const helpers = require('../helpers/helpers')

class UserController {

    getAllUsers = async (req, res) => {
        try {
            const users = await User.find({ role: "user" }).select("name email")

            if (!users.length) {
                return res.status(200).json(helpers.responseSuccess("No Users Founded"))
            }

            res.status(200).json(helpers.responseSuccess("Users Fetched Successfully", users))
        } catch (err) {
            res.status(500).json(helpers.responseError(err.message))
        }
    }

    getMe = async (req, res) => {
        try {
            const user = await User.findById(req.user.id)

            res.status(200).json(helpers.responseSuccess("User Profile Fetched Successfully", {
                name: user.name,
                email: user.email
            }))

        } catch (err) {
            res.status(500).json(helpers.responseError(err.message))
        }
    }

    updateMe = async (req, res) => {
        try {
            const { name, email, password } = req.body
            const user = await User.findById(req.user.id)

            if (!user) {
                return res.status(404).json(helpers.responseError("User not Founded"))
            }

            let isModified = false

            const wantsToChangeName = name && name !== user.name
            const wantsToChangeEmail = email && email.toLowerCase() !== user.email.toLowerCase()
            const wantsToChangePassword = password

            if (wantsToChangeName || wantsToChangeEmail || wantsToChangePassword) {
                if (wantsToChangeName) {
                    user.name = name
                    isModified = true
                }

                if (wantsToChangeEmail) {
                    user.email = email
                    isModified = true
                }

                if (wantsToChangePassword) {
                    user.password = await argon2.hash(password)
                    isModified = true
                }
            }

            if (!isModified) {
                return res.status(200).json(helpers.responseSuccess("No changes made, Data is the same", {
                    name: user.name,
                    email: user.email
                }))
            }

            await user.save()

            return res.status(200).json(helpers.responseSuccess("Profile Updated Successfully", {
                name: user.name,
                email: user.email
            }))

        } catch (err) {
            return res.status(500).json(helpers.responseError(err.message))
        }
    }

    deleteUser = async (req, res) => {
        try {
            const id = req.params.id

            await Message.deleteMany({ user: id })

            await ActivityLog.deleteMany({ user: id })

            await Note.deleteMany({ author: id })

            await User.findByIdAndDelete(id)

            res.status(200).json(helpers.responseSuccess("User Deleted Successfully"))
        } catch (err) {
            res.status(500).json(helpers.responseError(err.message))
        }
    }

}

module.exports = new UserController()