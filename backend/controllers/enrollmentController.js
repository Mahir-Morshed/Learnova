const pool = require("../config/db");

// POST /api/enrollments - student enrolls in a course
async function enrollInCourse(req, res) {
    try {
        const { courseid } = req.body;
        const student_id = req.user.id;
        if (!courseid) return res.status(400).json({ error: "courseid is required" });

        const result = await pool.query(
            "INSERT INTO enrollments (student_id, courseid) VALUES ($1, $2) RETURNING id",
            [student_id, courseid]
        );
        res.status(201).json({ message: "Enrolled successfully", enrollmentId: result.rows[0].id });
    } catch (err) {
        if (err.code === "23505") { // unique_violation in Postgres
            return res.status(409).json({ error: "Already enrolled in this course" });
        }
        console.error(err);
        res.status(500).json({ error: "Enrollment failed" });
    }
}

// GET /api/enrollments/course/:courseid - instructor view: who's enrolled
async function getEnrollmentsForCourse(req, res) {
    try {
        const { courseid } = req.params;
        const result = await pool.query(`
            SELECT s.s_id, s.first_name, s.last_name, s.email, e.enrollment_date, e.grade
            FROM enrollments e
            JOIN students s ON e.student_id = s.s_id
            WHERE e.courseid = $1
        `, [courseid]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch enrollments" });
    }
}

// PUT /api/enrollments/:id/grade - instructor sets a grade
async function setGrade(req, res) {
    try {
        const { id } = req.params;
        const { grade } = req.body;
        await pool.query("UPDATE enrollments SET grade = $1 WHERE id = $2", [grade, id]);
        res.json({ message: "Grade updated" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to update grade" });
    }
}

module.exports = { enrollInCourse, getEnrollmentsForCourse, setGrade };
