const express = require("express");
const router = express.Router();
const { verifyToken, verifyRole } = require("../middleware/authMiddleware");
const { getAllCategories, createCategory } = require("../controllers/categoryController");

router.get("/", getAllCategories);
router.post("/", verifyToken, verifyRole("instructor"), createCategory);

module.exports = router;
