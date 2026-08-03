const pool = require("../config/db");

async function getResourcesForLesson(req, res) {
    try {
        const { lessonId } = req.params;
        const result = await pool.query("SELECT * FROM resources WHERE lesson_id = $1", [lessonId]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch resources" });
    }
}

async function createResource(req, res) {
    try {
        const { lesson_id, title, resource_url, filesize } = req.body;
        if (!lesson_id || !title || !resource_url) {
            return res.status(400).json({ error: "lesson_id, title and resource_url are required" });
        }

        const result = await pool.query(
            `INSERT INTO resources (lesson_id, title, resource_url, filesize)
             VALUES ($1, $2, $3, $4) RETURNING id`,
            [lesson_id, title, resource_url, filesize || null]
        );
        res.status(201).json({ message: "Resource added", resourceId: result.rows[0].id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to add resource" });
    }
}

module.exports = { getResourcesForLesson, createResource };
