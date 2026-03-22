const express = require("express");
const cors = require("cors");

const analyticsRoutes = require("./routes/analyticsRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/analytics", analyticsRoutes);

// Health check route
app.get("/", (req, res) => {
    res.send("API is running...");
});

module.exports = app;
