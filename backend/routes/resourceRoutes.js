const express = require("express");
const router = express.Router();
const { verifyToken, verifyRole } = require("../middleware/authMiddleware");
const { getResourcesForLesson, createResource } = require("../controllers/resourceController");

router.get("/lesson/:lessonId", getResourcesForLesson);
router.post("/", verifyToken, verifyRole("instructor"), createResource);

module.exports = router;
