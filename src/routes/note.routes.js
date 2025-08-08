const express = require('express')
const router = express.Router()
const noteController = require("../controllers/note.controller")
const auth = require("../middlewares/auth.middleware")
const { filterNotesByRole, canAccessTaskNotes, canViewNoteById } = require("../middlewares/noteAccess")
const { canCreateNoteOnTask, canModifyNote } = require("../middlewares/notePermission.middleware")
const { noteValidate } = require("../validation/note.validate")

router.get("/", auth, filterNotesByRole, noteController.getAllNotes)
router.get("/task/:taskId", auth, canAccessTaskNotes, noteController.getNotesByTask)
router.get("/:id", auth, canViewNoteById, noteController.getNoteById)
router.post("/", auth, canCreateNoteOnTask, [...noteValidate], noteController.createNote)
router.put("/:id", auth, canModifyNote, [...noteValidate], noteController.updateNote)
router.delete("/:id", auth, canModifyNote, noteController.deleteNote)

module.exports = router