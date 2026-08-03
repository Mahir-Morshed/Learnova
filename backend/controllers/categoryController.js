const pool = require("../config/db");

async function getAllCategories(req, res) {
    try {
        const result = await pool.query("SELECT * FROM categories WHERE availability = TRUE");
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch categories" });
    }
}

async function createCategory(req, res) {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ error: "Name is required" });

        const result = await pool.query(
            "INSERT INTO categories (name) VALUES ($1) RETURNING id", [name]
        );
        res.status(201).json({ message: "Category created", categoryId: result.rows[0].id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to create category" });
    }
}

module.exports = { getAllCategories, createCategory };
