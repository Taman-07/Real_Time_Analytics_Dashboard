// ============================================================
// SHOPLYTICS - ANALYTICS CONTROLLER
// ============================================================

import Event from "../models/Event.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";


// ============================================================
// SETTINGS
// ============================================================

// Timezone used to group sales into hours and days.
const TIMEZONE = "Asia/Kolkata";

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;


// ============================================================
// START-FROM-ZERO CUTOFF
//
// Set ANALYTICS_START in backend/.env, for example:
//   ANALYTICS_START=2026-10-11T18:30:00+05:30
//
// Only orders and events created at or after that moment are
// counted. Older data stays in MongoDB, it is just ignored.
// Remove the variable (and restart the server) to count
// everything again.
//
// It is read inside the request, not at import time, so it works
// no matter when dotenv.config() runs in server.js.
// ============================================================

const getStartDate = () => {

    const raw = process.env.ANALYTICS_START;

    if (!raw) return null;

    const date = new Date(raw);

    return Number.isNaN(date.getTime()) ? null : date;

};


// ============================================================
// HELPERS
// ============================================================

// Returns { day: "2026-10-11", hour: "15" } for a date in TIMEZONE
const zonedParts = (date) => {

    const parts = Object.fromEntries(

        new Intl.DateTimeFormat("en-CA", {

            timeZone: TIMEZONE,
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            hourCycle: "h23"

        })
            .formatToParts(date)
            .map((p) => [p.type, p.value])

    );

    return {

        day: `${parts.year}-${parts.month}-${parts.day}`,
        hour: parts.hour

    };

};


// Growth in percent, 0 when there is nothing to compare against
const pct = (current, previous) =>
    previous > 0
        ? Math.round(((current - previous) / previous) * 1000) / 10
        : 0;


// ============================================================
// DASHBOARD ANALYTICS
// ============================================================

export const getDashboardAnalytics = async (req, res) => {

    try {

        const now = new Date();
        const start = getStartDate();

        // Filter that applies to everything on the dashboard
        const since = start
            ? { createdAt: { $gte: start } }
            : {};

        // createdAt range that never reaches back before `start`
        const range = (from, to) => ({

            createdAt: {

                $gte:
                    start && start > from
                        ? start
                        : from,

                ...(to ? { $lt: to } : {})

            }

        });


        // ====================================================
        // EVENTS
        // ====================================================

        const totalEvents =
            await Event.countDocuments(since);


        // ====================================================
        // ORDERS (latest 20)
        // ====================================================

        const orders =
            await Order
                .find(since)
                .sort({ createdAt: -1 })
                .limit(20)
                .lean();

        const totalOrders =
            await Order.countDocuments(since);


        // ====================================================
        // REVENUE (ONLY PAID ORDERS)
        // ====================================================

        const revenueResult =
            await Order.aggregate([

                { $match: { ...since, paymentStatus: "Paid" } },

                { $group: { _id: null, total: { $sum: "$totalAmount" } } }

            ]);

        const revenue =
            revenueResult.length > 0
                ? revenueResult[0].total
                : 0;


        // ====================================================
        // CUSTOMERS
        // ====================================================

        const customerResult =
            await Order.aggregate([

                { $match: since },

                { $group: { _id: "$customerEmail" } },

                { $count: "count" }

            ]);

        const customers =
            customerResult.length > 0
                ? customerResult[0].count
                : 0;


        // ====================================================
        // PRODUCTS (catalog size, not affected by the cutoff)
        // ====================================================

        const productCount =
            await Product.countDocuments();


        // ====================================================
        // ORDER STATUS
        // ====================================================

        const [delivered, pending, processing, cancelled] =
            await Promise.all([

                Order.countDocuments({ ...since, status: "Delivered" }),
                Order.countDocuments({ ...since, status: "Pending" }),
                Order.countDocuments({ ...since, status: "Processing" }),
                Order.countDocuments({ ...since, status: "Cancelled" })

            ]);


        // ====================================================
        // SALES BY DATE (ONLY PAID ORDERS)
        // Kept for compatibility, grouped per calendar day
        // ====================================================

        const salesResult =
            await Order.aggregate([

                { $match: { ...since, paymentStatus: "Paid" } },

                {
                    $group: {

                        _id: {
                            $dateToString: {
                                format: "%Y-%m-%d",
                                date: "$createdAt",
                                timezone: TIMEZONE
                            }
                        },

                        sales: { $sum: "$totalAmount" },

                        orders: { $sum: 1 }

                    }
                },

                { $sort: { _id: 1 } }

            ]);

        const sales =
            salesResult.map((item) => ({

                name: item._id,
                sales: Number(item.sales || 0),
                orders: Number(item.orders || 0)

            }));


        // ====================================================
        // WEEKLY CHART: last 7 days, one point per day
        // Days without sales are filled with 0
        // ====================================================

        const weeklyResult =
            await Order.aggregate([

                {
                    $match: {
                        paymentStatus: "Paid",
                        ...range(new Date(now.getTime() - 8 * DAY_MS))
                    }
                },

                {
                    $group: {

                        _id: {
                            $dateToString: {
                                format: "%Y-%m-%d",
                                date: "$createdAt",
                                timezone: TIMEZONE
                            }
                        },

                        sales: { $sum: "$totalAmount" }

                    }
                }

            ]);

        const weeklyMap =
            Object.fromEntries(
                weeklyResult.map((r) => [r._id, Number(r.sales || 0)])
            );

        const salesWeekly = [];

        for (let i = 6; i >= 0; i--) {

            const d = new Date(now.getTime() - i * DAY_MS);

            salesWeekly.push({

                name: d.toLocaleDateString("en-IN", {
                    timeZone: TIMEZONE,
                    weekday: "short"
                }),

                sales: weeklyMap[zonedParts(d).day] || 0

            });

        }


        // ====================================================
        // HOURLY CHART: last 12 hours, one point per hour
        // Hours without sales are filled with 0
        // ====================================================

        const hourlyResult =
            await Order.aggregate([

                {
                    $match: {
                        paymentStatus: "Paid",
                        ...range(new Date(now.getTime() - 13 * HOUR_MS))
                    }
                },

                {
                    $group: {

                        _id: {
                            $dateToString: {
                                format: "%Y-%m-%d %H",
                                date: "$createdAt",
                                timezone: TIMEZONE
                            }
                        },

                        sales: { $sum: "$totalAmount" }

                    }
                }

            ]);

        const hourlyMap =
            Object.fromEntries(
                hourlyResult.map((r) => [r._id, Number(r.sales || 0)])
            );

        const salesHourly = [];

        for (let i = 11; i >= 0; i--) {

            const d = new Date(now.getTime() - i * HOUR_MS);
            const { day, hour } = zonedParts(d);

            salesHourly.push({

                name: d.toLocaleTimeString("en-IN", {
                    timeZone: TIMEZONE,
                    hour: "numeric",
                    hour12: true
                }),

                sales: hourlyMap[`${day} ${hour}`] || 0

            });

        }


        // ====================================================
        // TOP PRODUCTS (ONLY PAID ORDERS)
        // ====================================================

        const productSalesResult =
            await Order.aggregate([

                { $match: { ...since, paymentStatus: "Paid" } },

                { $unwind: "$products" },

                {
                    $group: {

                        _id: "$products.productId",

                        productName: { $first: "$products.productName" },

                        sales: { $sum: "$products.quantity" },

                        revenue: {
                            $sum: {
                                $multiply: [
                                    "$products.quantity",
                                    "$products.price"
                                ]
                            }
                        }

                    }
                },

                { $sort: { sales: -1 } },

                { $limit: 10 }

            ]);

        const topProducts =
            productSalesResult.map((product) => ({

                productId: product._id,

                productName: product.productName || "Unknown Product",

                sales: Number(product.sales || 0),

                revenue: Number(product.revenue || 0)

            }));


        // ====================================================
        // GROWTH
        // Real numbers: last 7 days compared with the 7 days
        // before. Shows 0 when there is nothing to compare.
        // Customer and product growth are not calculated yet.
        // ====================================================

        const periodStats = (from, to) =>
            Order.aggregate([

                { $match: range(from, to) },

                {
                    $group: {

                        _id: null,

                        orders: { $sum: 1 },

                        revenue: {
                            $sum: {
                                $cond: [
                                    { $eq: ["$paymentStatus", "Paid"] },
                                    "$totalAmount",
                                    0
                                ]
                            }
                        }

                    }
                }

            ]);

        const last7Start = new Date(now.getTime() - 7 * DAY_MS);
        const prev7Start = new Date(now.getTime() - 14 * DAY_MS);

        const [recentRows, previousRows] =
            await Promise.all([

                periodStats(last7Start, new Date(now.getTime() + 1)),
                periodStats(prev7Start, last7Start)

            ]);

        const recent = recentRows[0] || { orders: 0, revenue: 0 };
        const previous = previousRows[0] || { orders: 0, revenue: 0 };

        const orderGrowth = pct(recent.orders, previous.orders);
        const revenueGrowth = pct(recent.revenue, previous.revenue);
        const customerGrowth = 0;
        const productGrowth = 0;


        // ====================================================
        // EVENT STATISTICS
        // ====================================================

        const eventStats =
            await Event.aggregate([

                { $match: since },

                { $group: { _id: "$type", count: { $sum: 1 } } },

                { $sort: { count: -1 } }

            ]);


        // ====================================================
        // RESPONSE
        // ====================================================

        res.json({

            success: true,

            analytics: {

                totalEvents,
                totalOrders,
                revenue,
                customers,
                products: productCount,
                orderGrowth,
                revenueGrowth,
                customerGrowth,
                productGrowth

            },

            orderStatus: {

                delivered,
                pending,
                processing,
                cancelled

            },

            eventStats,

            sales,
            salesWeekly,
            salesHourly,

            orders,

            products: topProducts

        });

    } catch (error) {

        console.error(
            "Analytics dashboard error:",
            error
        );

        res.status(500).json({

            success: false,

            message: "Failed to load analytics",

            error: error.message

        });

    }

};


// ============================================================
// GET ALL PRODUCTS
// ============================================================

export const getProducts = async (req, res) => {

    try {

        const products =
            await Product
                .find()
                .sort({ createdAt: -1 })
                .lean();

        res.json({

            success: true,

            count: products.length,

            products

        });

    } catch (error) {

        console.error(
            "Get products error:",
            error
        );

        res.status(500).json({

            success: false,

            message: "Failed to fetch products",

            error: error.message

        });

    }

};
