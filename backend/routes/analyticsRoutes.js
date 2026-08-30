import express from "express";

import {
    createEvent,
    getDashboardAnalytics,
    getRecentEvents,

    createOrder,
    updateOrderStatus,

    createProduct,
    getProducts

} from "../controllers/analyticsController.js";


const router = express.Router();


// ============================================================
// ANALYTICS / EVENTS
// ============================================================

router.post(
    "/event",
    createEvent
);

router.get(
    "/dashboard",
    getDashboardAnalytics
);

router.get(
    "/events",
    getRecentEvents
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


// ============================================================
// PRODUCTS
// ============================================================

router.post(
    "/products",
    createProduct
);

router.get(
    "/products",
    getProducts
);


export default router;