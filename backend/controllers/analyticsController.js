import Event from "../models/Event.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";


// ============================================================
// CREATE EVENT
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
                message:
                    "Event type is required"
            });
        }


        const event =
            await Event.create({

                type,

                productId,

                productName,

                userId,

                orderId,

                amount,

                category,

                metadata
            });


        if (req.io) {

            req.io.emit(
                "liveEvent",
                {
                    event
                }
            );
        }


        res.status(201).json({

            success: true,

            event
        });

    } catch (error) {

        console.error(
            "Create event error:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                "Failed to create analytics event"
        });
    }
};


// ============================================================
// GET DASHBOARD
// ============================================================

export const getDashboardAnalytics =
    async (req, res) => {

        try {

            const totalEvents =
                await Event.countDocuments();


            const totalOrders =
                await Order.countDocuments();


            const totalProducts =
                await Product.countDocuments();


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


            const revenueResult =
                await Order.aggregate([

                    {
                        $match: {
                            paymentStatus:
                                "Paid"
                        }
                    },

                    {
                        $group: {

                            _id: null,

                            total: {
                                $sum:
                                    "$totalAmount"
                            }
                        }
                    }
                ]);


            const revenue =
                revenueResult[0]?.total || 0;


            const customers =
                await Event.distinct(
                    "userId",
                    {
                        userId: {
                            $ne: null
                        }
                    }
                );


            const eventStats =
                await Event.aggregate([

                    {
                        $match: {
                            type: {
                                $ne: null
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


            const sales =
                await Order.aggregate([

                    {
                        $match: {
                            paymentStatus:
                                "Paid"
                        }
                    },

                    {
                        $group: {

                            _id: {
                                $dateToString: {

                                    format:
                                        "%Y-%m-%d",

                                    date:
                                        "$createdAt"
                                }
                            },

                            sales: {
                                $sum:
                                    "$totalAmount"
                            },

                            orders: {
                                $sum: 1
                            }
                        }
                    },

                    {
                        $sort: {
                            _id: 1
                        }
                    }
                ]);


            const recentOrders =
                await Order.find()
                    .sort({
                        createdAt: -1
                    })
                    .limit(10)
                    .lean();


            const topProducts =
                await Event.aggregate([

                    {
                        $match: {
                            type:
                                "PAYMENT_COMPLETED"
                        }
                    },

                    {
                        $group: {

                            _id:
                                "$productId",

                            productName: {
                                $first:
                                    "$productName"
                            },

                            sales: {
                                $sum: 1
                            },

                            revenue: {
                                $sum:
                                    "$amount"
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


            res.json({

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
                    sales.map(
                        item => ({

                            name:
                                item._id,

                            sales:
                                item.sales,

                            orders:
                                item.orders
                        })
                    ),


                orders:
                    recentOrders,


                products:
                    topProducts
            });

        } catch (error) {

            console.error(
                "Dashboard analytics error:",
                error
            );

            res.status(500).json({

                success: false,

                message:
                    "Failed to fetch dashboard analytics"
            });
        }
    };


// ============================================================
// RECENT EVENTS
// ============================================================

export const getRecentEvents =
    async (req, res) => {

        try {

            const events =
                await Event.find()
                    .sort({
                        createdAt: -1
                    })
                    .limit(20)
                    .lean();


            res.json({

                success: true,

                events
            });

        } catch (error) {

            res.status(500).json({

                success: false,

                message:
                    "Failed to fetch events"
            });
        }
    };


// ============================================================
// CREATE PRODUCT
// ============================================================

export const createProduct =
    async (req, res) => {

        try {

            const {
                externalId,
                title,
                price,
                category,
                thumbnail,
                brand,
                stock
            } = req.body;


            const product =
                await Product.create({

                    externalId,

                    title,

                    price,

                    category,

                    thumbnail,

                    brand,

                    stock
                });


            if (req.io) {

                req.io.emit(
                    "productsUpdated",
                    {
                        product
                    }
                );
            }


            res.status(201).json({

                success: true,

                message:
                    "Product created successfully",

                product
            });

        } catch (error) {

            console.error(
                "Create product error:",
                error
            );


            res.status(500).json({

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

export const createOrder =
    async (req, res) => {

        try {

            const {
                customerName,
                customerEmail,
                products,
                totalAmount
            } = req.body;


            if (
                !customerName ||
                !customerEmail ||
                !products?.length ||
                !totalAmount
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Customer, email, products and total amount are required"
                });
            }


            const orderId =
                `ORD-${Date.now()}`;


            const order =
                await Order.create({

                    orderId,

                    customerName,

                    customerEmail,

                    products,

                    totalAmount,

                    status:
                        "Pending",

                    paymentStatus:
                        "Pending"
                });


            const event =
                await Event.create({

                    type:
                        "ORDER_CREATED",

                    orderId,

                    userId:
                        customerEmail,

                    amount:
                        totalAmount,

                    metadata: {
                        customerName
                    }
                });


            if (req.io) {

                req.io.emit(
                    "liveOrder",
                    {
                        order,
                        event
                    }
                );

                req.io.emit(
                    "liveEvent",
                    {
                        event
                    }
                );
            }


            res.status(201).json({

                success: true,

                order
            });

        } catch (error) {

            console.error(
                "Create order error:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Failed to create order"
            });
        }
    };


// ============================================================
// UPDATE ORDER STATUS
// ============================================================

export const updateOrderStatus =
    async (req, res) => {

        try {

            const {
                orderId
            } = req.params;


            const {
                status
            } = req.body;


            const order =
                await Order.findOneAndUpdate(

                    {
                        orderId
                    },

                    {
                        status
                    },

                    {
                        new: true
                    }
                );


            if (!order) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Order not found"
                });
            }


            if (
                status ===
                "Delivered"
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

                    metadata: {

                        customer:
                            order.customerName
                    }
                });
            }


            if (
                status ===
                "Cancelled"
            ) {

                await Event.create({

                    type:
                        "ORDER_CANCELLED",

                    orderId,

                    amount:
                        order.totalAmount
                });
            }


            if (req.io) {

                req.io.emit(
                    "orderUpdated",
                    {
                        order
                    }
                );
            }


            res.json({

                success: true,

                order
            });

        } catch (error) {

            console.error(
                "Update order error:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Failed to update order"
            });
        }
    };