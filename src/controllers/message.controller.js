const Message = require("../models/Message")
const helpers = require('../helpers/helpers')

class MessageController {

    getMessages = async (req, res) => {
        try {
            const messages = await Message.find()
                .sort({ createdAt: -1 })
                .limit(50)
                .populate('user', 'name')

            if (messages.length === 50) {
                const lastKeptId = messages[49]._id
                await Message.deleteMany({ _id: { $lt: lastKeptId } })
            }

            const formattedMessages = messages.map(msg => ({
                _id: msg._id,
                userId: msg.user._id,
                username: msg.user.name,
                text: msg.text,
            }))

            return res.status(200).json(
                helpers.responseSuccess("Messages Fetched Successfully", formattedMessages)
            )
        } catch (err) {
            return res.status(500).json(
                helpers.responseError(err.message)
            )
        }
    }
    
}

module.exports = new MessageController()
