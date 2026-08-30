import express from "express";

import {
    getDashboardAnalytics,
    getProducts
} from "../controllers/analyticsController.js";


const router = express.Router();


// ============================================================
// DASHBOARD
// ============================================================

router.get(
    "/dashboard",
    getDashboardAnalytics
);


// ============================================================
// PRODUCTS
// ============================================================

router.get(
    "/products",
    getProducts
);


export default router;
