const express = require("express");
const router = express.Router();
const { studentSignup, studentLogin, instructorSignup, instructorLogin } = require("../controllers/authController");

router.post("/student/signup", studentSignup);
router.post("/student/login", studentLogin);
router.post("/instructor/signup", instructorSignup);
router.post("/instructor/login", instructorLogin);

module.exports = router;
