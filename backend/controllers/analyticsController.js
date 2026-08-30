// ============================================================
// SHOPLYTICS - ANALYTICS CONTROLLER
// ============================================================

import Event from "../models/Event.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";


// ============================================================
// CREATE ANALYTICS EVENT
// ============================================================

export const createEvent = async (req, res) => {

    try {

        const {
            type,
            productId,
            productName,
            userId,
            orderId,
            amount,
            category,
            metadata
        } = req.body;


        if (!type) {

            return res.status(400).json({
                success: false,
                message: "Event type is required"
            });

        }


        const event = await Event.create({

            type,

            productId:
                productId ?? null,

            productName:
                productName ?? null,

            userId:
                userId ?? null,

            orderId:
                orderId ?? null,

            amount:
                amount ?? 0,

            category:
                category ?? null,

            metadata:
                metadata ?? {}

        });


        // REAL-TIME SOCKET UPDATE

        if (req.io) {

            req.io.emit(
                "analyticsUpdated",
                {
                    event,
                    message: "New analytics event received"
                }
            );

        }


        return res.status(201).json({

            success: true,

            message:
                "Event created successfully",

            event

        });


    } catch (error) {

        console.error(
            "CREATE EVENT ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                error.message,

            error:
                error.name

        });

    }

};



// ============================================================
// DASHBOARD ANALYTICS
// ============================================================

export const getDashboardAnalytics = async (req, res) => {

    try {

        // ----------------------------------------------------
        // TOTAL EVENTS
        // ----------------------------------------------------

        const totalEvents =
            await Event.countDocuments();


        // ----------------------------------------------------
        // TOTAL ORDERS
        // ----------------------------------------------------

        const totalOrders =
            await Order.countDocuments();


        // ----------------------------------------------------
        // TOTAL PRODUCTS
        // ----------------------------------------------------

        const totalProducts =
            await Product.countDocuments();


        // ----------------------------------------------------
        // ORDER STATUS
        // ----------------------------------------------------

        const deliveredOrders =
            await Order.countDocuments({
                status: "Delivered"
            });


        const pendingOrders =
            await Order.countDocuments({
                status: "Pending"
            });


        const processingOrders =
            await Order.countDocuments({
                status: "Processing"
            });


        const cancelledOrders =
            await Order.countDocuments({
                status: "Cancelled"
            });


        // ----------------------------------------------------
        // REVENUE
        // ----------------------------------------------------

        const revenueResult =
            await Order.aggregate([

                {
                    $match: {
                        paymentStatus: "Paid"
                    }
                },

                {
                    $group: {

                        _id: null,

                        total: {
                            $sum: "$totalAmount"
                        }

                    }
                }

            ]);


        const revenue =
            revenueResult[0]?.total || 0;


        // ----------------------------------------------------
        // CUSTOMERS
        // ----------------------------------------------------

        const customers =
            await Event.distinct(
                "userId",
                {
                    userId: {
                        $nin: [
                            null,
                            ""
                        ]
                    }
                }
            );


        // ----------------------------------------------------
        // EVENT STATISTICS
        // ----------------------------------------------------

        const eventStats =
            await Event.aggregate([

                {
                    $match: {
                        type: {
                            $nin: [
                                null,
                                ""
                            ]
                        }
                    }
                },

                {
                    $group: {

                        _id: "$type",

                        count: {
                            $sum: 1
                        }

                    }
                },

                {
                    $sort: {
                        count: -1
                    }
                }

            ]);


        // ----------------------------------------------------
        // SALES BY DATE
        // ----------------------------------------------------

        const sales =
            await Order.aggregate([

                {
                    $match: {
                        paymentStatus: "Paid"
                    }
                },

                {
                    $group: {

                        _id: {
                            $dateToString: {
                                format: "%Y-%m-%d",
                                date: "$createdAt"
                            }
                        },

                        sales: {
                            $sum: "$totalAmount"
                        },

                        orders: {
                            $sum: 1
                        }

                    }
                },

                {
                    $sort: {
                        "_id": 1
                    }
                }

            ]);


        // ----------------------------------------------------
        // RECENT ORDERS
        // ----------------------------------------------------

        const recentOrders =
            await Order
                .find()
                .sort({
                    createdAt: -1
                })
                .limit(10)
                .lean();


        // ----------------------------------------------------
        // TOP PRODUCTS
        // ----------------------------------------------------

        const topProducts =
            await Event.aggregate([

                {
                    $match: {
                        type: "PRODUCT_PURCHASED"
                    }
                },

                {
                    $group: {

                        _id: "$productId",

                        productName: {
                            $first:
                                "$productName"
                        },

                        sales: {
                            $sum: 1
                        },

                        revenue: {
                            $sum: "$amount"
                        }

                    }
                },

                {
                    $sort: {
                        sales: -1
                    }
                },

                {
                    $limit: 5
                }

            ]);


        // ----------------------------------------------------
        // DASHBOARD RESPONSE
        // ----------------------------------------------------

        return res.json({

            success: true,

            analytics: {

                totalEvents,

                totalOrders,

                revenue,

                customers:
                    customers.length,

                products:
                    totalProducts,

                orderGrowth: 8.4,

                revenueGrowth: 12.6,

                customerGrowth: 14.2,

                productGrowth: 5.2

            },

            orderStatus: {

                delivered:
                    deliveredOrders,

                pending:
                    pendingOrders,

                processing:
                    processingOrders,

                cancelled:
                    cancelledOrders

            },

            eventStats,

            sales:
                sales.map(item => ({

                    name:
                        item._id,

                    sales:
                        item.sales,

                    orders:
                        item.orders

                })),

            orders:
                recentOrders,

            products:
                topProducts

        });


    } catch (error) {

        console.error(
            "DASHBOARD ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                error.message,

            error:
                error.name

        });

    }

};



// ============================================================
// GET RECENT EVENTS
// ============================================================

export const getRecentEvents = async (req, res) => {

    try {

        const events =
            await Event
                .find()
                .sort({
                    createdAt: -1
                })
                .limit(20)
                .lean();


        return res.json({

            success: true,

            count:
                events.length,

            events

        });


    } catch (error) {

        console.error(
            "GET EVENTS ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                error.message,

            error:
                error.name

        });

    }

};



// ============================================================
// CREATE ORDER
// ============================================================

export const createOrder = async (req, res) => {

    try {

        console.log(
            "ORDER REQUEST:",
            req.body
        );


        const {
            customerName,
            customerEmail,
            products,
            totalAmount
        } = req.body;


        // ----------------------------------------------------
        // VALIDATION
        // ----------------------------------------------------

        if (!customerName) {

            return res.status(400).json({

                success: false,

                message:
                    "customerName is required"

            });

        }


        if (
            !Array.isArray(products) ||
            products.length === 0
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "products must be a non-empty array"

            });

        }


        if (
            totalAmount === undefined ||
            totalAmount === null
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "totalAmount is required"

            });

        }


        // ----------------------------------------------------
        // CREATE ORDER ID
        // ----------------------------------------------------

        const orderId =
            `ORD-${Date.now()}`;


        // ----------------------------------------------------
        // CREATE ORDER
        // ----------------------------------------------------

        const order =
            await Order.create({

                orderId,

                customerName,

                customerEmail:
                    customerEmail || "",

                products,

                totalAmount:
                    Number(totalAmount),

                status:
                    "Pending",

                paymentStatus:
                    "Pending"

            });


        // ----------------------------------------------------
        // CREATE ORDER EVENT
        // ----------------------------------------------------

        const event =
            await Event.create({

                type:
                    "ORDER_CREATED",

                orderId,

                userId:
                    customerEmail || null,

                amount:
                    Number(totalAmount),

                metadata: {

                    customerName

                }

            });


        // ----------------------------------------------------
        // REAL-TIME SOCKET UPDATE
        // ----------------------------------------------------

        if (req.io) {

            req.io.emit(
                "analyticsUpdated",
                {

                    event,

                    order,

                    message:
                        "New order created"

                }
            );

        }


        return res.status(201).json({

            success: true,

            message:
                "Order created successfully",

            order

        });


    } catch (error) {

        console.error(
            "CREATE ORDER ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                error.message,

            error:
                error.name

        });

    }

};



// ============================================================
// UPDATE ORDER STATUS
// ============================================================

export const updateOrderStatus = async (req, res) => {

    try {

        const {
            orderId
        } = req.params;


        const {
            status
        } = req.body;


        const allowedStatuses = [

            "Pending",
            "Processing",
            "Delivered",
            "Cancelled"

        ];


        if (
            !allowedStatuses.includes(status)
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Invalid order status",

                allowedStatuses

            });

        }


        const order =
            await Order.findOneAndUpdate(

                {
                    orderId
                },

                {
                    status
                },

                {
                    new: true,
                    runValidators: true
                }

            );


        if (!order) {

            return res.status(404).json({

                success: false,

                message:
                    "Order not found"

            });

        }


        // ----------------------------------------------------
        // DELIVERED → PAID
        // ----------------------------------------------------

        if (
            status === "Delivered"
        ) {

            order.paymentStatus =
                "Paid";

            await order.save();


            await Event.create({

                type:
                    "PAYMENT_COMPLETED",

                orderId,

                amount:
                    order.totalAmount,

                userId:
                    order.customerEmail,

                metadata: {

                    customer:
                        order.customerName

                }

            });

        }


        // ----------------------------------------------------
        // CANCELLED
        // ----------------------------------------------------

        if (
            status === "Cancelled"
        ) {

            await Event.create({

                type:
                    "ORDER_CANCELLED",

                orderId,

                amount:
                    order.totalAmount,

                userId:
                    order.customerEmail

            });

        }


        // ----------------------------------------------------
        // SOCKET UPDATE
        // ----------------------------------------------------

        if (req.io) {

            req.io.emit(
                "analyticsUpdated",
                {

                    order,

                    event: {

                        type:
                            status === "Cancelled"
                                ? "ORDER_CANCELLED"
                                : "ORDER_UPDATED",

                        orderId

                    }

                }
            );

        }


        return res.json({

            success: true,

            message:
                "Order status updated",

            order

        });


    } catch (error) {

        console.error(
            "UPDATE ORDER ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                error.message,

            error:
                error.name

        });

    }

};



// ============================================================
// CREATE PRODUCT
// ============================================================

export const createProduct = async (req, res) => {

    try {

        console.log(
            "PRODUCT REQUEST:",
            req.body
        );


        const {
            externalId,
            title,
            price,
            category,
            thumbnail,
            brand,
            stock
        } = req.body;


        // ----------------------------------------------------
        // VALIDATION
        // ----------------------------------------------------

        if (
            externalId === undefined ||
            !title ||
            price === undefined
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "externalId, title and price are required"

            });

        }


        // ----------------------------------------------------
        // CREATE PRODUCT
        // ----------------------------------------------------

        const product =
            await Product.create({

                externalId:
                    Number(externalId),

                title:
                    title.trim(),

                price:
                    Number(price),

                category:
                    category || "Other",

                thumbnail:
                    thumbnail || "",

                brand:
                    brand || "",

                stock:
                    stock !== undefined
                        ? Number(stock)
                        : 0

            });


        // ----------------------------------------------------
        // SOCKET UPDATE
        // ----------------------------------------------------

        if (req.io) {

            req.io.emit(
                "analyticsUpdated",
                {

                    product,

                    message:
                        "New product added"

                }
            );

        }


        return res.status(201).json({

            success: true,

            message:
                "Product created successfully",

            product

        });


    } catch (error) {

        console.error(
            "CREATE PRODUCT ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                error.message,

            error:
                error.name

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
                .sort({
                    createdAt: -1
                })
                .lean();


        return res.json({

            success: true,

            count:
                products.length,

            products

        });


    } catch (error) {

        console.error(
            "GET PRODUCTS ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                error.message,

            error:
                error.name

        });

    }

};