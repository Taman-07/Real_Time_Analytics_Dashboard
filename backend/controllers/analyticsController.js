// ============================================================
// SHOPLYTICS - ANALYTICS CONTROLLER
// ============================================================

import Event from "../models/Event.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";


// ============================================================
// DASHBOARD ANALYTICS
// ============================================================

export const getDashboardAnalytics = async (req, res) => {

    try {

        // ====================================================
        // EVENTS
        // ====================================================

        const totalEvents =
            await Event.countDocuments();


        // ====================================================
        // ORDERS
        // ====================================================

        const orders =
            await Order
                .find()
                .sort({
                    createdAt: -1
                })
                .limit(20)
                .lean();


        const totalOrders =
            await Order.countDocuments();


        // ====================================================
        // REVENUE
        // ONLY PAID ORDERS
        // ====================================================

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

                        _id:
                            null,

                        total: {

                            $sum:
                                "$totalAmount"

                        }

                    }

                }

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

                {

                    $group: {

                        _id:
                            "$customerEmail"

                    }

                },

                {

                    $count:
                        "count"

                }

            ]);


        const customers =
            customerResult.length > 0
                ? customerResult[0].count
                : 0;


        // ====================================================
        // PRODUCTS
        // ====================================================

        const productCount =
            await Product.countDocuments();


        // ====================================================
        // ORDER STATUS
        // ====================================================

        const delivered =
            await Order.countDocuments({

                status:
                    "Delivered"

            });


        const pending =
            await Order.countDocuments({

                status:
                    "Pending"

            });


        const processing =
            await Order.countDocuments({

                status:
                    "Processing"

            });


        const cancelled =
            await Order.countDocuments({

                status:
                    "Cancelled"

            });


        // ====================================================
        // SALES BY DATE
        // ONLY PAID ORDERS
        // ====================================================

        const salesResult =
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

                            $sum:
                                1

                        }

                    }

                },

                {

                    $sort: {

                        _id:
                            1

                    }

                }

            ]);


        const sales =
            salesResult.map(
                (item) => ({

                    name:
                        item._id,

                    sales:
                        Number(
                            item.sales || 0
                        ),

                    orders:
                        Number(
                            item.orders || 0
                        )

                })
            );


        // ====================================================
        // TOP PRODUCTS
        // ====================================================

        const productSalesResult =
            await Order.aggregate([

                {

                    $match: {

                        paymentStatus:
                            "Paid"

                    }

                },

                {

                    $unwind:
                        "$products"

                },

                {

                    $group: {

                        _id:
                            "$products.productId",

                        productName: {

                            $first:
                                "$products.productName"

                        },

                        sales: {

                            $sum:
                                "$products.quantity"

                        },

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

                {

                    $sort: {

                        sales:
                            -1

                    }

                },

                {

                    $limit:
                        10

                }

            ]);


        const topProducts =
            productSalesResult.map(
                (product) => ({

                    productId:
                        product._id,

                    productName:
                        product.productName ||
                        "Unknown Product",

                    sales:
                        Number(
                            product.sales || 0
                        ),

                    revenue:
                        Number(
                            product.revenue || 0
                        )

                })
            );


        // ====================================================
        // GROWTH
        // ====================================================

        const orderGrowth =
            8.4;

        const revenueGrowth =
            12.6;

        const customerGrowth =
            14.2;

        const productGrowth =
            5.2;


        // ====================================================
        // EVENT STATISTICS
        // ====================================================

        const eventStats =
            await Event.aggregate([

                {

                    $group: {

                        _id:
                            "$type",

                        count: {

                            $sum:
                                1

                        }

                    }

                },

                {

                    $sort: {

                        count:
                            -1

                    }

                }

            ]);


        // ====================================================
        // RESPONSE
        // ====================================================

        res.json({

            success:
                true,

            analytics: {

                totalEvents,

                totalOrders,

                revenue,

                customers,

                products:
                    productCount,

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

            orders,

            products:
                topProducts

        });

    } catch (error) {

        console.error(
            "Analytics dashboard error:",
            error
        );


        res.status(500).json({

            success:
                false,

            message:
                "Failed to load analytics",

            error:
                error.message

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
                    createdAt:
                        -1
                })
                .lean();


        res.json({

            success:
                true,

            count:
                products.length,

            products

        });

    } catch (error) {

        console.error(
            "Get products error:",
            error
        );


        res.status(500).json({

            success:
                false,

            message:
                "Failed to fetch products",

            error:
                error.message

        });

    }

};