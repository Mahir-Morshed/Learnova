const pool = require("../config/db");

async function verifyCourseOwnership(courseid, instructorId) {
    const result = await pool.query("SELECT instructor_id FROM courses WHERE courseid = $1", [courseid]);
    if (result.rows.length === 0) return { ok: false, status: 404, error: "Course not found" };
    if (result.rows[0].instructor_id !== instructorId) return { ok: false, status: 403, error: "Not your course" };
    return { ok: true };
}

async function getModulesForCourse(req, res) {
    try {
        const { courseid } = req.params;
        const result = await pool.query(
            "SELECT * FROM modules WHERE courseid = $1 ORDER BY order_number ASC", [courseid]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch modules" });
    }
}

async function createModule(req, res) {
    try {
        const { courseid, title, order_number } = req.body;
        if (!courseid || !title) return res.status(400).json({ error: "courseid and title are required" });

        const check = await verifyCourseOwnership(courseid, req.user.id);
        if (!check.ok) return res.status(check.status).json({ error: check.error });

        const result = await pool.query(
            "INSERT INTO modules (courseid, title, order_number) VALUES ($1, $2, $3) RETURNING id",
            [courseid, title, order_number || 1]
        );
        res.status(201).json({ message: "Module created", moduleId: result.rows[0].id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to create module" });
    }
}

module.exports = { getModulesForCourse, createModule };
