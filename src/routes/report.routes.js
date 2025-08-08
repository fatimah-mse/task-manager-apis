const express = require("express")
const router = express.Router()
const auth = require("../middlewares/auth.middleware")
const role = require("../middlewares/role.middleware")
const reportController = require('../controllers/report.controller')

router.get('/projects/:projectId',auth, role(["admin"]), reportController.generateProjectReportPDF)

module.exports = router