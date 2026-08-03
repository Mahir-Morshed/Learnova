const pool = require("../config/db");

async function submitExam(req, res) {
    try {
        const { exam_id } = req.body;
        const student_id = req.user.id;
        if (!exam_id) return res.status(400).json({ error: "exam_id is required" });

        const result = await pool.query(
            "INSERT INTO submissions (student_id, exam_id) VALUES ($1, $2) RETURNING id",
            [student_id, exam_id]
        );
        res.status(201).json({ message: "Submitted", submissionId: result.rows[0].id });
    } catch (err) {
        if (err.code === "23505") {
            return res.status(409).json({ error: "Already submitted this exam" });
        }
        console.error(err);
        res.status(500).json({ error: "Submission failed" });
    }
}

async function getSubmissionsForExam(req, res) {
    try {
        const { examId } = req.params;
        const result = await pool.query(`
            SELECT sub.*, s.first_name, s.last_name, s.email
            FROM submissions sub
            JOIN students s ON sub.student_id = s.s_id
            WHERE sub.exam_id = $1
            ORDER BY sub.submission_time DESC
        `, [examId]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch submissions" });
    }
}

async function gradeSubmission(req, res) {
    try {
        const { id } = req.params;
        const { score, feedback } = req.body;
        await pool.query(
            "UPDATE submissions SET score = $1, feedback = $2, submission_status = 'graded' WHERE id = $3",
            [score, feedback || null, id]
        );
        res.json({ message: "Submission graded" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to grade submission" });
    }
}

module.exports = { submitExam, getSubmissionsForExam, gradeSubmission };
