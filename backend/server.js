const express = require("express");
const http = require("http");
const cors = require("cors");
const dotenv = require("dotenv");
const { Server } = require("socket.io");

const connectDB = require("./config/db");
const analyticsRoutes = require("./routes/analyticsRoutes");
const setupAnalyticsSocket = require("./socket/analyticsSocket");

dotenv.config();

const app = express();

const server = http.createServer(app);


// ==========================================
// SOCKET.IO
// ==========================================

const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"]
    }
});

app.set("io", io);


// ==========================================
// DATABASE
// ==========================================

connectDB();


// ==========================================
// MIDDLEWARE
// ==========================================

app.use(
    cors({
        origin: "http://localhost:5173",
        credentials: true
    })
);

app.use(express.json());


// ==========================================
// TEST ROUTE
// ==========================================

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Real-Time Analytics API is running 🚀"
    });
});


// ==========================================
// ROUTES
// ==========================================

app.use("/api/analytics", analyticsRoutes);


// ==========================================
// SOCKET SETUP
// ==========================================

setupAnalyticsSocket(io);


// ==========================================
// SERVER
// ==========================================

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
