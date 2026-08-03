-- Learnova Database Schema (PostgreSQL) — matches the finalized ERD
-- Run: psql -U your_db_user -d learnova -f database/schema.sql

-- 1. Students
CREATE TABLE students (
    s_id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    institution VARCHAR(150),
    dob DATE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Instructors
CREATE TABLE instructors (
    i_id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    institution VARCHAR(150),
    qualification VARCHAR(150),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Categories
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    availability BOOLEAN DEFAULT TRUE
);

-- 4. Courses (teaches: instructor->courses, contains: category->courses)
CREATE TABLE courses (
    courseid SERIAL PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    price NUMERIC(10,2) DEFAULT 0.00,
    instructor_id INT NOT NULL REFERENCES instructors(i_id) ON DELETE CASCADE,
    category_id INT REFERENCES categories(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Enrollments (resolves Student <--enrolls--> Courses, M:N, with enrollment_date + grade)
CREATE TABLE enrollments (
    id SERIAL PRIMARY KEY,
    student_id INT NOT NULL REFERENCES students(s_id) ON DELETE CASCADE,
    courseid INT NOT NULL REFERENCES courses(courseid) ON DELETE CASCADE,
    enrollment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    grade VARCHAR(5),
    UNIQUE (student_id, courseid)
);

-- 6. Modules (Courses --has--> Modules)
CREATE TABLE modules (
    id SERIAL PRIMARY KEY,
    courseid INT NOT NULL REFERENCES courses(courseid) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    order_number INT DEFAULT 1
);

-- 7. Lessons (Modules --contain--> Lesson)
CREATE TABLE lessons (
    id SERIAL PRIMARY KEY,
    module_id INT NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    video_url VARCHAR(255),
    is_preview BOOLEAN DEFAULT FALSE,
    order_number INT DEFAULT 1
);

-- 8. Resources (Lesson --has--> Resource)
CREATE TABLE resources (
    id SERIAL PRIMARY KEY,
    lesson_id INT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    resource_url VARCHAR(255) NOT NULL,
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    filesize INT
);

-- 9. Exams (Courses --has--> Exam)
CREATE TABLE exams (
    id SERIAL PRIMARY KEY,
    courseid INT NOT NULL REFERENCES courses(courseid) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    total_marks INT DEFAULT 100,
    exam_date TIMESTAMP
);

-- 10. Submissions (Student --submits--> Exam)
CREATE TABLE submissions (
    id SERIAL PRIMARY KEY,
    student_id INT NOT NULL REFERENCES students(s_id) ON DELETE CASCADE,
    exam_id INT NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    submission_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    feedback TEXT,
    score INT,
    submission_status VARCHAR(20) DEFAULT 'submitted' CHECK (submission_status IN ('submitted', 'graded', 'late')),
    UNIQUE (student_id, exam_id)
);

-- ---------- Seed data for quick testing ----------
INSERT INTO categories (name, availability) VALUES
('Web Development', TRUE), ('Data Science', TRUE), ('Mathematics', TRUE);

INSERT INTO instructors (first_name, last_name, email, password, institution, qualification) VALUES
('Karim', 'Rahman', 'karim@example.com', '$2b$10$placeholderhash', 'BUET', 'PhD in CSE');

INSERT INTO students (first_name, last_name, email, password, institution, dob) VALUES
('Zabir', 'Hasan', 'zabir@example.com', '$2b$10$placeholderhash', 'CUET', '2003-05-10');

INSERT INTO courses (title, description, price, instructor_id, category_id) VALUES
('Database Fundamentals', 'Learn relational databases from scratch.', 500.00, 1, 1);

INSERT INTO modules (courseid, title, order_number) VALUES
(1, 'Introduction to SQL', 1),
(1, 'Joins and Subqueries', 2);

INSERT INTO lessons (module_id, title, video_url, is_preview, order_number) VALUES
(1, 'What is a database?', 'https://example.com/video1.mp4', TRUE, 1),
(1, 'Writing your first SELECT', 'https://example.com/video2.mp4', FALSE, 2);

INSERT INTO resources (lesson_id, title, resource_url, filesize) VALUES
(1, 'Lecture slides - Intro', 'https://example.com/slides1.pdf', 850);

INSERT INTO exams (courseid, title, total_marks) VALUES
(1, 'Midterm - SQL Basics', 50);
