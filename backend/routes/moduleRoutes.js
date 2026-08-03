const express = require("express");
const router = express.Router();
const { verifyToken, verifyRole } = require("../middleware/authMiddleware");
const { getModulesForCourse, createModule } = require("../controllers/moduleController");

router.get("/course/:courseid", getModulesForCourse);
router.post("/", verifyToken, verifyRole("instructor"), createModule);

module.exports = router;
