const nodemailer = require("nodemailer")
require('dotenv').config()

const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD
const EMAIL = process.env.ADMIN_EMAIL

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: EMAIL,
        pass: EMAIL_PASSWORD
    }
})

async function sendOTPEmail(to, otp) {
    try {
        const opts = {
            from: `"Support Team" ${EMAIL}`,
            to,
            subject: "Password Reset OTP",
            html: `
                <h2 style="font-size: 28px;">Password Reset Request</h2>
                <p style="font-size: 20px;">Your OTP is: <strong>${otp}</strong></p>
                <p style="font-size: 20px;">This code is valid for 5 minutes.</p>
            `
        }

        await transporter.sendMail(opts)
    } catch (error) {
        console.error(error.message)
    }
}

async function sendNotificationEmail(to, message) {
    try {
        const msg = {
            from: `"Support Team" ${EMAIL}`,
            to,
            subject: "Notification",
            html: `<p style="font-size: 20px;">${message}</p>`
        }

        await transporter.sendMail(msg)
    } catch (error) {
        console.error(error.message)
    }
}

module.exports = {sendOTPEmail, sendNotificationEmail}