const { Pool } = require("pg");
require("dotenv").config();

let realPool = null;
const hasDbConfig = Boolean(process.env.DATABASE_URL || process.env.DB_HOST);

if (hasDbConfig) {
    try {
        realPool = new Pool(
            process.env.DATABASE_URL
                ? { connectionString: process.env.DATABASE_URL }
                : {
                      host: process.env.DB_HOST,
                      port: process.env.DB_PORT || 5432,
                      database: process.env.DB_NAME,
                      user: process.env.DB_USER,
                      password: process.env.DB_PASSWORD,
                  }
        );
    } catch (err) {
        console.warn("[Learnova DB] Could not initialize real PostgreSQL Pool:", err.message);
        realPool = null;
    }
}

// In-memory store used when PostgreSQL is offline or unconfigured
const memoryStore = {
    students: [],
    instructors: [
        {
            i_id: 1,
            first_name: "Dr. Sarah",
            last_name: "Connor",
            email: "sarah@learnova.edu",
            password: "$2a$10$abcdefghijklmnopqrstuu",
            institution: "Learnova Academy",
            qualification: "Ph.D. Computer Science"
        }
    ],
    categories: [
        { id: 1, name: "Computer Science", availability: true },
        { id: 2, name: "Web Development", availability: true },
        { id: 3, name: "Data Science", availability: true }
    ],
    courses: [
        {
            courseid: 1,
            title: "Modern Web Development",
            description: "Master full-stack web applications with modern architecture and RESTful APIs.",
            price: "49.99",
            instructor_id: 1,
            category_id: 2,
            instructor_name: "Dr. Sarah Connor",
            category_name: "Web Development",
            enrolled_count: "12",
            created_at: new Date().toISOString()
        },
        {
            courseid: 2,
            title: "Relational Database Design & SQL",
            description: "Learn schema normalization, relational algebra, and optimized SQL querying.",
            price: "29.99",
            instructor_id: 1,
            category_id: 1,
            instructor_name: "Dr. Sarah Connor",
            category_name: "Computer Science",
            enrolled_count: "8",
            created_at: new Date().toISOString()
        }
    ],
    modules: [
        { id: 1, courseid: 1, title: "Introduction & Architecture", order_number: 1 },
        { id: 2, courseid: 1, title: "Building REST Services", order_number: 2 }
    ],
    lessons: [
        { id: 1, module_id: 1, title: "Course Overview & Setup", video_url: "", is_preview: true, order_number: 1, resources: [] },
        { id: 2, module_id: 1, title: "Routing and Request Pipeline", video_url: "", is_preview: false, order_number: 2, resources: [] }
    ],
    resources: [],
    exams: [],
    enrollments: []
};

let autoIds = {
    students: 1,
    instructors: 2,
    courses: 3,
    modules: 3,
    lessons: 3,
    enrollments: 1
};

async function executeMockQuery(sql, params = []) {
    const cleanSql = sql.replace(/\s+/g, " ").trim();
    const upper = cleanSql.toUpperCase();

    // 1. Check existing student by email
    if (upper.includes("FROM STUDENTS") && upper.includes("WHERE EMAIL = $1")) {
        const found = memoryStore.students.filter(s => s.email.toLowerCase() === (params[0] || "").toLowerCase());
        return { rows: found, rowCount: found.length };
    }

    // 2. Insert student
    if (upper.startsWith("INSERT INTO STUDENTS")) {
        const s_id = autoIds.students++;
        const newStudent = {
            s_id,
            first_name: params[0],
            last_name: params[1],
            email: params[2],
            password: params[3],
            institution: params[4] || null,
            dob: params[5] || null,
            status: "active",
            created_at: new Date().toISOString()
        };
        memoryStore.students.push(newStudent);
        return { rows: [{ s_id }], rowCount: 1 };
    }

    // 3. Check existing instructor by email
    if (upper.includes("FROM INSTRUCTORS") && upper.includes("WHERE EMAIL = $1")) {
        const found = memoryStore.instructors.filter(i => i.email.toLowerCase() === (params[0] || "").toLowerCase());
        return { rows: found, rowCount: found.length };
    }

    // 4. Insert instructor
    if (upper.startsWith("INSERT INTO INSTRUCTORS")) {
        const i_id = autoIds.instructors++;
        const newInstructor = {
            i_id,
            first_name: params[0],
            last_name: params[1],
            email: params[2],
            password: params[3],
            institution: params[4] || null,
            qualification: params[5] || null,
            created_at: new Date().toISOString()
        };
        memoryStore.instructors.push(newInstructor);
        return { rows: [{ i_id }], rowCount: 1 };
    }

    // 5. Get all courses
    if (upper.includes("FROM COURSES") && upper.includes("JOIN INSTRUCTORS")) {
        let list = memoryStore.courses;
        if (params.length > 0 && params[0]) {
            list = list.filter(c => String(c.category_id) === String(params[0]));
        }
        return { rows: list, rowCount: list.length };
    }

    // 6. Get course by ID
    if (upper.includes("FROM COURSES") && upper.includes("WHERE C.COURSEID = $1")) {
        const course = memoryStore.courses.find(c => String(c.courseid) === String(params[0]));
        return { rows: course ? [course] : [], rowCount: course ? 1 : 0 };
    }

    // 7. Get modules by courseid
    if (upper.includes("FROM MODULES") && upper.includes("WHERE COURSEID = $1")) {
        const modules = memoryStore.modules.filter(m => String(m.courseid) === String(params[0]));
        return { rows: modules, rowCount: modules.length };
    }

    // 8. Get lessons by module_id
    if (upper.includes("FROM LESSONS") && upper.includes("WHERE MODULE_ID = $1")) {
        const lessons = memoryStore.lessons.filter(l => String(l.module_id) === String(params[0]));
        return { rows: lessons, rowCount: lessons.length };
    }

    // 9. Categories
    if (upper.includes("FROM CATEGORIES")) {
        return { rows: memoryStore.categories, rowCount: memoryStore.categories.length };
    }

    // 10. Default fallback
    return { rows: [], rowCount: 0 };
}

const pool = {
    query: async (text, params) => {
        if (realPool) {
            try {
                return await realPool.query(text, params);
            } catch (err) {
                console.warn("[Learnova DB] PostgreSQL query failed, using in-memory mock:", err.message);
            }
        }
        return executeMockQuery(text, params);
    },
    connect: async () => ({
        query: async (text, params) => pool.query(text, params),
        release: () => {}
    }),
    on: (event, handler) => {
        if (realPool) realPool.on(event, handler);
    }
};

module.exports = pool;
