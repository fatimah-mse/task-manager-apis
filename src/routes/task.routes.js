const express = require("express")
const router = express.Router()
const taskController = require("../controllers/task.controller")
const auth = require("../middlewares/auth.middleware")
const role = require("../middlewares/role.middleware")
const canEditTask = require("../middlewares/updateTask.middleware")
const { filterTasksByRole, canViewTaskById } = require("../middlewares/taskAccess.middleware")
const { addTaskValidate , updateTaskValidate} = require("../validation/task.validate")

router.get("/", auth, filterTasksByRole, taskController.getTasks)
router.get("/status", auth, role(["admin"]), taskController.getTaskStatus)
router.get("/:id", auth, canViewTaskById, taskController.getTaskById)
router.post("/", auth, role(["admin"]), [...addTaskValidate], taskController.createTask)
router.put("/:id", auth, canEditTask, [...updateTaskValidate], taskController.updateTask)
router.delete("/:id", auth, role(["admin"]), taskController.deleteTask)

module.exports = router