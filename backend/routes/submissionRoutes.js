const express = require("express");
const router = express.Router();
const { verifyToken, verifyRole } = require("../middleware/authMiddleware");
const { submitExam, getSubmissionsForExam, gradeSubmission } = require("../controllers/submissionController");

router.post("/", verifyToken, verifyRole("student"), submitExam);
router.get("/exam/:examId", verifyToken, verifyRole("instructor"), getSubmissionsForExam);
router.put("/:id/grade", verifyToken, verifyRole("instructor"), gradeSubmission);

module.exports = router;
