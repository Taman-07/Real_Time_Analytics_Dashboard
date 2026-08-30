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


import analyticsRoutes
    from "./routes/analyticsRoutes.js";

import authRoutes
    from "./routes/authRoutes.js";


import {
    analyticsSocket
} from "./socket/analyticsSocket.js";


import {
    syncExternalProducts
} from "./services/externalDataService.js";


import {
    startLiveEventEngine
} from "./services/liveEventEngine.js";


// ============================================================
// ENVIRONMENT
// ============================================================

dotenv.config();


// ============================================================
// DATABASE
// ============================================================

await connectDB();


// ============================================================
// EXPRESS
// ============================================================

const app =
    express();


// ============================================================
// HTTP SERVER
// ============================================================

const server =
    http.createServer(app);


// ============================================================
// SOCKET.IO
// ============================================================

const io =
    new Server(
        server,
        {

            cors: {

                origin:
                    "http://localhost:5173",

                credentials:
                    true
            }
        }
    );


// ============================================================
// SOCKET HANDLER
// ============================================================

analyticsSocket(io);


// ============================================================
// MIDDLEWARE
// ============================================================

app.use(

    cors({

        origin:
            "http://localhost:5173",

        credentials:
            true
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

        resave:
            false,

        saveUninitialized:
            false,

        cookie: {

            httpOnly:
                true,

            secure:
                false,

            maxAge:
                1000 *
                60 *
                60 *
                24
        }

    })

);


// ============================================================
// SOCKET AVAILABLE IN CONTROLLERS
// ============================================================

app.use(
    (req, res, next) => {

        req.io =
            io;

        next();
    }
);


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

app.get(
    "/",
    (req, res) => {

        res.json({

            success:
                true,

            message:
                "Shoplytics API is running"
        });

    }
);


// ============================================================
// EXTERNAL PRODUCTS
// ============================================================

const startExternalSync =
    async () => {

        await syncExternalProducts(
            io
        );


        setInterval(
            async () => {

                await syncExternalProducts(
                    io
                );

            },
            60000
        );

    };


// ============================================================
// START LIVE ENGINE
// ============================================================

const startServices =
    async () => {

        await startExternalSync();

        startLiveEventEngine(
            io
        );

    };


startServices();


// ============================================================
// SERVER
// ============================================================

const PORT =
    process.env.PORT ||
    5000;


server.listen(
    PORT,
    () => {

        console.log(
            `🚀 Shoplytics server running on port ${PORT}`
        );

    }
);
