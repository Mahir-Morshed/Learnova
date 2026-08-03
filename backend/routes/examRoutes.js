const express = require("express");
const router = express.Router();
const { verifyToken, verifyRole } = require("../middleware/authMiddleware");
const { getExamsForCourse, createExam } = require("../controllers/examController");

router.get("/course/:courseid", getExamsForCourse);
router.post("/", verifyToken, verifyRole("instructor"), createExam);

module.exports = router;
