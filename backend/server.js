// ============================================================
// SHOPLYTICS - SERVER
// ============================================================

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import session from "express-session";
import http from "http";
import { Server } from "socket.io";

import connectDB from "./config/db.js";

import analyticsRoutes from "./routes/analyticsRoutes.js";
import authRoutes from "./routes/authRoutes.js";


// ============================================================
// ENVIRONMENT
// ============================================================

dotenv.config();


// ============================================================
// CONNECT DATABASE
// ============================================================

await connectDB();


// ============================================================
// EXPRESS APP
// ============================================================

const app = express();


// ============================================================
// HTTP SERVER
// ============================================================

const server = http.createServer(app);


// ============================================================
// SOCKET.IO
// ============================================================

const io = new Server(server, {

    cors: {

        origin: "http://localhost:5173",

        credentials: true

    }

});


// ============================================================
// SOCKET CONNECTION
// ============================================================

io.on("connection", (socket) => {

    console.log(
        "Dashboard connected:",
        socket.id
    );


    socket.on("disconnect", () => {

        console.log(
            "Dashboard disconnected:",
            socket.id
        );

    });

});


// ============================================================
// MIDDLEWARE
// ============================================================

app.use(

    cors({

        origin:
            "http://localhost:5173",

        credentials: true

    })

);


app.use(
    express.json()
);


// ============================================================
// SESSION
// ============================================================

app.use(

    session({

        secret:
            process.env.SESSION_SECRET ||
            "shoplytics-secret",

        resave: false,

        saveUninitialized: false,

        cookie: {

            httpOnly: true,

            secure: false,

            maxAge:
                1000 * 60 * 60 * 24

        }

    })

);


// ============================================================
// MAKE SOCKET.IO AVAILABLE TO CONTROLLERS
// ============================================================

app.use((req, res, next) => {

    req.io = io;

    next();

});


// ============================================================
// ROUTES
// ============================================================

app.use(
    "/auth",
    authRoutes
);


app.use(
    "/analytics",
    analyticsRoutes
);


// ============================================================
// HEALTH CHECK
// ============================================================

app.get("/", (req, res) => {

    res.json({

        success: true,

        message:
            "Shoplytics API is running"

    });

});


// ============================================================
// SERVER
// ============================================================

const PORT =
    process.env.PORT || 5000;


server.listen(
    PORT,
    () => {

        console.log(
            `Server running on port ${PORT}`
        );

    }
);
