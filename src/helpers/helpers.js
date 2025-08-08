const argon2 = require("argon2")
const ActivityLog = require("../models/ActivityLog")
const User = require('../models/User')

class Helpers {

    responseSuccess = (message, data = null) => {
        return {
            state: "success",
            message,
            data
        }
    }

    responseError = (message, data = null) => {
        return {
            state: "error",
            message,
            data
        }
    }

    hash = async (password) => {
        try {
            const hash = await argon2.hash(password);

            return hash;
        } catch (err) {
            throw new Error(err.message)
        }
    }

    verify = async (password1, password2) => {
        try {
            const hash = await argon2.verify(password2, password1);

            return hash;
        } catch (err) {
            throw new Error(err.message)
        }
    }

    createAdmin = async (User, email, password) => {
        try {
            const isExist = await User.findOne({ role: "admin" })

            if (isExist) {
                throw new Error("Admin is Existed")
            }

            const hashed = await this.hash(password)

            await User.create({ name: "admin", email, password: hashed, role: "admin" })
        } catch (error) {
            throw new Error(error.message)
        }
    }

    role = (roles) => {
        return async (req, res, next) => {
            try {
                for (const role of roles) {
                    if (req.user.role === role) {
                        next();
                        return;
                    }
                }

                return res.status(401).json({ message: "You can not access to this action" })
            } catch (error) {
                throw new Error(error.message)
            }
        }
    }

    generateOTP = () => {
        const otp = Math.floor(100000 + Math.random() * 900000);
        return otp.toString();
    }

    logActivity = async ({ userId, type, description, project = null, task = null, note = null }) => {
        try {
            await ActivityLog.create({
                user: userId,
                type,
                description,
                project,
                task,
                note
            })
        } catch (error) {
            throw new Error(error.message)
        }
    }

    getAdminId = async () => {
        try {
            const admin = await User.findOne({ role: 'admin' })
            return admin?._id
        } catch (error) {
            throw new Error(error.message)
        }
    }
}

module.exports = new Helpers()