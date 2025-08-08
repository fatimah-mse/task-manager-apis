const express = require("express")
const router = express.Router()
const userController = require("../controllers/user.controller")
const auth = require("../middlewares/auth.middleware")
const role = require("../middlewares/role.middleware")
const { updateMeValidate } = require("../validation/user.validate")

router.get("/", auth, role(["admin"]), userController.getAllUsers)
router.get("/me", auth, userController.getMe)
router.put("/me", auth, updateMeValidate, userController.updateMe)
router.delete("/user/:id", auth, role(["admin"]), userController.deleteUser)

module.exports = router