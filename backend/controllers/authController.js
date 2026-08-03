const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");
require("dotenv").config();

function signToken(id, role, email) {
    return jwt.sign({ id, role, email }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

// ---------------- STUDENT ----------------

// POST /api/auth/student/signup
async function studentSignup(req, res) {
    try {
        const { first_name, last_name, email, password, institution, dob } = req.body;
        if (!first_name || !last_name || !email || !password) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const existing = await pool.query("SELECT s_id FROM students WHERE email = $1", [email]);
        if (existing.rows.length > 0) return res.status(409).json({ error: "Email already registered" });

        const hashed = await bcrypt.hash(password, 10);
        const result = await pool.query(
            `INSERT INTO students (first_name, last_name, email, password, institution, dob)
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING s_id`,
            [first_name, last_name, email, hashed, institution || null, dob || null]
        );
        const s_id = result.rows[0].s_id;

        const token = signToken(s_id, "student", email);
        res.status(201).json({
            message: "Signup successful",
            token,
            user: { id: s_id, first_name, last_name, email, role: "student" }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error during student signup" });
    }
}

// POST /api/auth/student/login
async function studentLogin(req, res) {
    try {
        const { email, password } = req.body;
        const result = await pool.query("SELECT * FROM students WHERE email = $1", [email]);
        if (result.rows.length === 0) return res.status(401).json({ error: "Invalid email or password" });

        const student = result.rows[0];
        const match = await bcrypt.compare(password, student.password);
        if (!match) return res.status(401).json({ error: "Invalid email or password" });

        const token = signToken(student.s_id, "student", student.email);
        res.json({
            message: "Login successful",
            token,
            user: { id: student.s_id, first_name: student.first_name, last_name: student.last_name, email: student.email, role: "student" }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error during student login" });
    }
}

// ---------------- INSTRUCTOR ----------------

// POST /api/auth/instructor/signup
async function instructorSignup(req, res) {
    try {
        const { first_name, last_name, email, password, institution, qualification } = req.body;
        if (!first_name || !last_name || !email || !password) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const existing = await pool.query("SELECT i_id FROM instructors WHERE email = $1", [email]);
        if (existing.rows.length > 0) return res.status(409).json({ error: "Email already registered" });

        const hashed = await bcrypt.hash(password, 10);
        const result = await pool.query(
            `INSERT INTO instructors (first_name, last_name, email, password, institution, qualification)
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING i_id`,
            [first_name, last_name, email, hashed, institution || null, qualification || null]
        );
        const i_id = result.rows[0].i_id;

        const token = signToken(i_id, "instructor", email);
        res.status(201).json({
            message: "Signup successful",
            token,
            user: { id: i_id, first_name, last_name, email, role: "instructor" }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error during instructor signup" });
    }
}

// POST /api/auth/instructor/login
async function instructorLogin(req, res) {
    try {
        const { email, password } = req.body;
        const result = await pool.query("SELECT * FROM instructors WHERE email = $1", [email]);
        if (result.rows.length === 0) return res.status(401).json({ error: "Invalid email or password" });

        const instructor = result.rows[0];
        const match = await bcrypt.compare(password, instructor.password);
        if (!match) return res.status(401).json({ error: "Invalid email or password" });

        const token = signToken(instructor.i_id, "instructor", instructor.email);
        res.json({
            message: "Login successful",
            token,
            user: { id: instructor.i_id, first_name: instructor.first_name, last_name: instructor.last_name, email: instructor.email, role: "instructor" }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error during instructor login" });
    }
}

module.exports = { studentSignup, studentLogin, instructorSignup, instructorLogin };
