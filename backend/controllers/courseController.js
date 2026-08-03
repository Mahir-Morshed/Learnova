const pool = require("../config/db");

// GET /api/courses - all courses with instructor + category joined in
async function getAllCourses(req, res) {
    try {
        const { category_id } = req.query;
        let sql = `
            SELECT c.courseid, c.title, c.description, c.price, c.created_at,
                   CONCAT(i.first_name, ' ', i.last_name) AS instructor_name,
                   cat.name AS category_name,
                   COUNT(e.id) AS enrolled_count
            FROM courses c
            JOIN instructors i ON c.instructor_id = i.i_id
            LEFT JOIN categories cat ON c.category_id = cat.id
            LEFT JOIN enrollments e ON e.courseid = c.courseid
        `;
        const params = [];
        if (category_id) {
            sql += " WHERE c.category_id = $1";
            params.push(category_id);
        }
        sql += " GROUP BY c.courseid, i.first_name, i.last_name, cat.name ORDER BY c.created_at DESC";

        const result = await pool.query(sql, params);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch courses" });
    }
}

// GET /api/courses/:id - single course + full module -> lesson -> resource tree
async function getCourseById(req, res) {
    try {
        const { id } = req.params;

        const courseResult = await pool.query(`
            SELECT c.*, CONCAT(i.first_name, ' ', i.last_name) AS instructor_name, cat.name AS category_name
            FROM courses c
            JOIN instructors i ON c.instructor_id = i.i_id
            LEFT JOIN categories cat ON c.category_id = cat.id
            WHERE c.courseid = $1
        `, [id]);

        if (courseResult.rows.length === 0) return res.status(404).json({ error: "Course not found" });
        const course = courseResult.rows[0];

        const modulesResult = await pool.query(
            "SELECT * FROM modules WHERE courseid = $1 ORDER BY order_number ASC", [id]
        );
        const modules = modulesResult.rows;

        for (const mod of modules) {
            const lessonsResult = await pool.query(
                "SELECT * FROM lessons WHERE module_id = $1 ORDER BY order_number ASC", [mod.id]
            );
            const lessons = lessonsResult.rows;

            for (const lesson of lessons) {
                const resourcesResult = await pool.query(
                    "SELECT * FROM resources WHERE lesson_id = $1", [lesson.id]
                );
                lesson.resources = resourcesResult.rows;
            }
            mod.lessons = lessons;
        }
        course.modules = modules;

        const examsResult = await pool.query("SELECT * FROM exams WHERE courseid = $1", [id]);
        course.exams = examsResult.rows;

        res.json(course);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch course" });
    }
}

// GET /api/courses/my - courses the logged-in student is enrolled in
async function getMyCourses(req, res) {
    try {
        const result = await pool.query(`
            SELECT c.courseid, c.title, c.description, e.enrollment_date, e.grade
            FROM enrollments e
            JOIN courses c ON e.courseid = c.courseid
            WHERE e.student_id = $1
            ORDER BY e.enrollment_date DESC
        `, [req.user.id]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch your courses" });
    }
}

// GET /api/courses/teaching - courses the logged-in instructor teaches
async function getTeachingCourses(req, res) {
    try {
        const result = await pool.query(
            "SELECT * FROM courses WHERE instructor_id = $1 ORDER BY created_at DESC",
            [req.user.id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch your courses" });
    }
}

// POST /api/courses (instructor only)
async function createCourse(req, res) {
    try {
        const { title, description, price, category_id } = req.body;
        if (!title) return res.status(400).json({ error: "Title is required" });

        const result = await pool.query(
            `INSERT INTO courses (title, description, price, instructor_id, category_id)
             VALUES ($1, $2, $3, $4, $5) RETURNING courseid`,
            [title, description, price || 0, req.user.id, category_id || null]
        );
        res.status(201).json({ message: "Course created", courseId: result.rows[0].courseid });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to create course" });
    }
}

module.exports = { getAllCourses, getCourseById, getMyCourses, getTeachingCourses, createCourse };
