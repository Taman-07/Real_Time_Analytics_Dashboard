import express from "express";

import {
    createEvent,
    getDashboardAnalytics,
    getRecentEvents,
    createProduct,
    createOrder,
    updateOrderStatus
} from "../controllers/analyticsController.js";


const router =
    express.Router();


// ============================================================
// EVENTS
// ============================================================

router.post(
    "/event",
    createEvent
);


router.get(
    "/events",
    getRecentEvents
);


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

router.post(
    "/product",
    createProduct
);


// ============================================================
// ORDERS
// ============================================================

router.post(
    "/orders",
    createOrder
);


router.patch(
    "/orders/:orderId/status",
    updateOrderStatus
);


export default router;