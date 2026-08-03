const pool = require("../config/db");

async function getExamsForCourse(req, res) {
    try {
        const { courseid } = req.params;
        const result = await pool.query("SELECT * FROM exams WHERE courseid = $1", [courseid]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch exams" });
    }
}

async function createExam(req, res) {
    try {
        const { courseid, title, total_marks, exam_date } = req.body;
        if (!courseid || !title) return res.status(400).json({ error: "courseid and title are required" });

        const result = await pool.query(
            `INSERT INTO exams (courseid, title, total_marks, exam_date)
             VALUES ($1, $2, $3, $4) RETURNING id`,
            [courseid, title, total_marks || 100, exam_date || null]
        );
        res.status(201).json({ message: "Exam created", examId: result.rows[0].id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to create exam" });
    }
}

module.exports = { getExamsForCourse, createExam };
