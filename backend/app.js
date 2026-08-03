const express = require("express");
const cors = require("cors");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/institutions", require("./routes/institutionRoutes"));
app.use("/api/courses", require("./routes/courseRoutes"));
app.use("/api/lessons", require("./routes/lessonRoutes"));
app.use("/api/resources", require("./routes/resourceRoutes"));
app.use("/api/enrollments", require("./routes/enrollmentRoutes"));
app.use("/api/discussions", require("./routes/discussionRoutes"));
app.use("/api/quizzes", require("./routes/quizRoutes"));
app.use("/api/messages", require("./routes/messageRoutes"));
app.use("/api/groups", require("./routes/groupRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/payments", require("./routes/paymentRoutes"));

// Test Route
app.get("/", (req, res) => {
    res.send("Welcome to Learnova API");
});

module.exports = app;
