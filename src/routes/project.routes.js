const express = require("express")
const router = express.Router()
const projectController = require("../controllers/project.controller")
const auth = require("../middlewares/auth.middleware")
const role = require("../middlewares/role.middleware")
const { filterProjectsByRole, canViewProjectById } = require("../middlewares/projectAccess.middleware")
const { addProjectValidate, updateProjectValidate } = require("../validation/project.validate")

router.get("/", auth, filterProjectsByRole, projectController.getProjects)
router.get('/status', auth, role(["admin"]), projectController.getProjectStatus)
router.get("/:id", auth, canViewProjectById, projectController.getProjectById)
router.post("/", auth, role(["admin"]), [...addProjectValidate], projectController.createProject)
router.put("/:id", auth, role(["admin"]), [...updateProjectValidate], projectController.updateProject)
router.delete("/:id", auth, role(["admin"]), projectController.deleteProject)

module.exports = router