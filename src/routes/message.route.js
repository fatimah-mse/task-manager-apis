const express = require('express')
const router = express.Router()
const messageController = require('../controllers/message.controller')
const auth = require('../middlewares/auth.middleware')

router.get('/', auth, messageController.getMessages)

module.exports = router
