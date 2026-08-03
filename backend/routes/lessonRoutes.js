const express = require("express");
const router = express.Router();
const { verifyToken, verifyRole } = require("../middleware/authMiddleware");
const { getLessonsForModule, createLesson } = require("../controllers/lessonController");

router.get("/module/:moduleId", getLessonsForModule);
router.post("/", verifyToken, verifyRole("instructor"), createLesson);

module.exports = router;
