const { default: mongoose, Schema } = require("mongoose")

const OTPSchema = new mongoose.Schema({
    user: { 
        type: Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
    },
    password: { 
        type: String, 
        required: true 
    },
    secretKey: { 
        type: String, 
        required: true 
    }
}, {
    timestamps: true
})

OTPSchema.index({ createdAt: 1 }, { expireAfterSeconds: 300 })

const OTP = mongoose.model("OTP", OTPSchema)

module.exports = OTP