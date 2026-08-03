const pool = require("../config/db");

async function getLessonsForModule(req, res) {
    try {
        const { moduleId } = req.params;
        const result = await pool.query(
            "SELECT * FROM lessons WHERE module_id = $1 ORDER BY order_number ASC", [moduleId]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch lessons" });
    }
}

async function createLesson(req, res) {
    try {
        const { module_id, title, video_url, is_preview, order_number } = req.body;
        if (!module_id || !title) return res.status(400).json({ error: "module_id and title are required" });

        const result = await pool.query(
            `INSERT INTO lessons (module_id, title, video_url, is_preview, order_number)
             VALUES ($1, $2, $3, $4, $5) RETURNING id`,
            [module_id, title, video_url || null, !!is_preview, order_number || 1]
        );
        res.status(201).json({ message: "Lesson created", lessonId: result.rows[0].id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to create lesson" });
    }
}

module.exports = { getLessonsForModule, createLesson };
