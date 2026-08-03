const express = require("express");
const router = express.Router();
const { verifyToken, verifyRole } = require("../middleware/authMiddleware");
const { enrollInCourse, getEnrollmentsForCourse, setGrade } = require("../controllers/enrollmentController");

router.post("/", verifyToken, verifyRole("student"), enrollInCourse);
router.get("/course/:courseid", verifyToken, verifyRole("instructor"), getEnrollmentsForCourse);
router.put("/:id/grade", verifyToken, verifyRole("instructor"), setGrade);

module.exports = router;
