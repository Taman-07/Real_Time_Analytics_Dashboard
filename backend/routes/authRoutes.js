import express from "express";

import {
    signup,
    login,
    logout,
    getCurrentUser
} from "../controllers/authController.js";


const router = express.Router();


// ============================================================
// AUTH ROUTES
// ============================================================

// Sign up
router.post(
    "/signup",
    signup
);


// Login
router.post(
    "/login",
    login
);


// Logout
router.post(
    "/logout",
    logout
);


// Current logged-in user
router.get(
    "/me",
    getCurrentUser
);


export default router;