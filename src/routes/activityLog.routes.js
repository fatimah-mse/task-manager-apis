const express = require("express")
const router = express.Router()
const activityLogController = require("../controllers/activityLog.controller")
const auth = require("../middlewares/auth.middleware")
const role = require("../middlewares/role.middleware")

router.get("/", [auth], role(["admin"]), activityLogController.getActivityLogs)

module.exports = router