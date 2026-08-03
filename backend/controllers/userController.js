const pool = require("../config/db");

// GET /api/users/me - works for whichever role is logged in (checks JWT role)
async function getMyProfile(req, res) {
    try {
        const { id, role } = req.user;

        if (role === "student") {
            const result = await pool.query(
                "SELECT s_id, first_name, last_name, email, institution, dob, status, created_at FROM students WHERE s_id = $1",
                [id]
            );
            if (result.rows.length === 0) return res.status(404).json({ error: "Student not found" });

            const enrolledCount = await pool.query(
                "SELECT COUNT(*) FROM enrollments WHERE student_id = $1", [id]
            );

            return res.json({ ...result.rows[0], role, enrolled_count: parseInt(enrolledCount.rows[0].count, 10) });
        }

        if (role === "instructor") {
            const result = await pool.query(
                "SELECT i_id, first_name, last_name, email, institution, qualification, created_at FROM instructors WHERE i_id = $1",
                [id]
            );
            if (result.rows.length === 0) return res.status(404).json({ error: "Instructor not found" });

            const teachingCount = await pool.query(
                "SELECT COUNT(*) FROM courses WHERE instructor_id = $1", [id]
            );

            return res.json({ ...result.rows[0], role, teaching_count: parseInt(teachingCount.rows[0].count, 10) });
        }

        res.status(400).json({ error: "Unknown role" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch profile" });
    }
}

module.exports = { getMyProfile };
