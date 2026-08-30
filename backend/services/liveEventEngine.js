// ============================================================
// SHOPLYTICS - LIVE EVENT ENGINE
// ============================================================

import Product from "../models/Product.js";
import Event from "../models/Event.js";
import Order from "../models/Order.js";


// ============================================================
// FETCH PRODUCTS
// ============================================================

export const fetchProducts = async () => {

    try {

        const products = await Product.find();

        console.log(
            `Products found: ${products.length}`
        );

        return products;

    } catch (error) {

        console.error(
            "Product fetch error:",
            error.message
        );

        return [];

    }

};


// ============================================================
// UPDATE PRODUCT
// ============================================================

export const updateProduct = async (product) => {

    try {

        const savedProduct =
            await Product.findOneAndUpdate(

                {
                    externalId:
                        product.externalId
                },

                {
                    externalId:
                        product.externalId,

                    title:
                        product.title,

                    price:
                        product.price,

                    category:
                        product.category ||
                        "Other",

                    thumbnail:
                        product.thumbnail ||
                        "",

                    brand:
                        product.brand ||
                        "",

                    stock:
                        product.stock || 0
                },

                {
                    upsert: true,
                    new: true
                }

            );


        console.log(
            "Product synced:",
            savedProduct.title
        );


        return savedProduct;

    } catch (error) {

        console.error(
            "Product sync error:",
            error.message
        );

        return null;

    }

};


// ============================================================
// CREATE LIVE EVENT
// ============================================================

const createLiveEvent = async ({
    type,
    product,
    order = null,
    io
}) => {

    try {

        const event =
            await Event.create({

                type,

                productId:
                    product?.externalId || null,

                productName:
                    product?.title || null,

                category:
                    product?.category || null,

                orderId:
                    order?.orderId || null,

                amount:
                    order?.totalAmount ||
                    product?.price ||
                    0,

                metadata: {

                    source:
                        "live-engine",

                    simulated:
                        true

                }

            });


        console.log(
            `Live event: ${type} - ${product?.title || "N/A"}`
        );


        if (io) {

            io.emit(
                "analyticsUpdated",
                {

                    event,

                    message:
                        "New live e-commerce event"

                }
            );

        }


        return event;

    } catch (error) {

        console.error(
            "Event creation error:",
            error.message
        );

        return null;

    }

};


// ============================================================
// CREATE SIMULATED ORDER
// ============================================================

const createSimulatedOrder = async (
    product,
    io
) => {

    try {

        // ------------------------------------------------------
        // CUSTOMER
        // ------------------------------------------------------

        const customerNames = [

            "Aarav Sharma",
            "Priya Singh",
            "Rahul Kumar",
            "Ananya Verma",
            "Tamanjot",
            "Riya Kapoor",
            "Arjun Mehta"

        ];


        const randomName =
            customerNames[
                Math.floor(
                    Math.random() *
                    customerNames.length
                )
            ];


        const customerEmail =
            randomName
                .toLowerCase()
                .replaceAll(" ", ".") +
            "@shoplytics.demo";


        // ------------------------------------------------------
        // QUANTITY
        // ------------------------------------------------------

        const quantity =
            Math.floor(
                Math.random() * 2
            ) + 1;


        // ------------------------------------------------------
        // IMPORTANT:
        // PRICE COMES FROM CURRENT PRODUCT
        // ------------------------------------------------------

        const price =
            Number(product.price || 0);


        const totalAmount =
            price * quantity;


        // ------------------------------------------------------
        // ORDER ID
        // ------------------------------------------------------

        const orderId =
            `ORD-${Date.now()}-${Math.floor(
                Math.random() * 1000
            )}`;


        // ------------------------------------------------------
        // CREATE ORDER
        // ------------------------------------------------------

        const order =
            await Order.create({

                orderId,

                customerName:
                    randomName,

                customerEmail,

                products: [

                    {

                        productId:
                            product.externalId,

                        productName:
                            product.title,

                        quantity,

                        price

                    }

                ],

                totalAmount,

                status:
                    "Pending",

                paymentStatus:
                    "Pending"

            });


        console.log(
            `Order created: ${order.orderId} - ₹${totalAmount}`
        );


        // ------------------------------------------------------
        // ORDER CREATED EVENT
        // ------------------------------------------------------

        await createLiveEvent({

            type:
                "ORDER_CREATED",

            product,

            order,

            io

        });


        // ------------------------------------------------------
        // EMIT UPDATED ANALYTICS
        // ------------------------------------------------------

        if (io) {

            io.emit(
                "orderCreated",
                {

                    order,

                    message:
                        "New order created"

                }
            );

        }


        // ------------------------------------------------------
        // SIMULATE PAYMENT
        // ------------------------------------------------------

        setTimeout(
            async () => {

                try {

                    const paidOrder =
                        await Order.findByIdAndUpdate(

                            order._id,

                            {

                                paymentStatus:
                                    "Paid",

                                status:
                                    "Delivered"

                            },

                            {
                                new: true
                            }

                        );


                    if (!paidOrder) {

                        return;

                    }


                    // ------------------------------------------
                    // PAYMENT EVENT
                    // ------------------------------------------

                    await createLiveEvent({

                        type:
                            "PAYMENT_COMPLETED",

                        product,

                        order:
                            paidOrder,

                        io

                    });


                    // ------------------------------------------
                    // PRODUCT PURCHASED EVENT
                    // ------------------------------------------

                    await createLiveEvent({

                        type:
                            "PRODUCT_PURCHASED",

                        product,

                        order:
                            paidOrder,

                        io

                    });


                    console.log(
                        `Payment completed: ${paidOrder.orderId} - ₹${paidOrder.totalAmount}`
                    );


                    // ------------------------------------------
                    // SEND ORDER UPDATE
                    // ------------------------------------------

                    if (io) {

                        io.emit(
                            "orderUpdated",
                            {

                                order:
                                    paidOrder,

                                message:
                                    "Payment completed"

                            }
                        );


                        // Force dashboard refresh

                        io.emit(
                            "analyticsUpdated",
                            {

                                order:
                                    paidOrder,

                                message:
                                    "Analytics updated after payment"

                            }
                        );

                    }

                } catch (error) {

                    console.error(
                        "Payment simulation error:",
                        error.message
                    );

                }

            },

            3000

        );


        return order;

    } catch (error) {

        console.error(
            "Order creation error:",
            error.message
        );

        return null;

    }

};


// ============================================================
// NORMAL RANDOM EVENT
// ============================================================

const createRandomEvent = async (products, io) => {

    const randomProduct =
        products[
            Math.floor(
                Math.random() *
                products.length
            )
        ];


    const eventTypes = [

        "PRODUCT_VIEWED",

        "PRODUCT_SEARCHED",

        "PRODUCT_ADDED_TO_CART",

        "CHECKOUT_STARTED"

    ];


    const randomType =
        eventTypes[
            Math.floor(
                Math.random() *
                eventTypes.length
            )
        ];


    await createLiveEvent({

        type:
            randomType,

        product:
            randomProduct,

        io

    });

};


// ============================================================
// COMPLETE PURCHASE JOURNEY
// ============================================================

const createPurchaseJourney = async (
    product,
    io
) => {

    console.log(
        `Starting purchase journey: ${product.title}`
    );


    // ----------------------------------------------------------
    // SEARCH
    // ----------------------------------------------------------

    await createLiveEvent({

        type:
            "PRODUCT_SEARCHED",

        product,

        io

    });


    // ----------------------------------------------------------
    // VIEW
    // ----------------------------------------------------------

    setTimeout(
        async () => {

            await createLiveEvent({

                type:
                    "PRODUCT_VIEWED",

                product,

                io

            });

        },
        700
    );


    // ----------------------------------------------------------
    // ADD TO CART
    // ----------------------------------------------------------

    setTimeout(
        async () => {

            await createLiveEvent({

                type:
                    "PRODUCT_ADDED_TO_CART",

                product,

                io

            });

        },
        1400
    );


    // ----------------------------------------------------------
    // CHECKOUT
    // ----------------------------------------------------------

    setTimeout(
        async () => {

            await createLiveEvent({

                type:
                    "CHECKOUT_STARTED",

                product,

                io

            });

        },
        2100
    );


    // ----------------------------------------------------------
    // CREATE ORDER
    // ----------------------------------------------------------

    setTimeout(
        async () => {

            await createSimulatedOrder(
                product,
                io
            );

        },
        2800
    );

};


// ============================================================
// START LIVE EVENT ENGINE
// ============================================================

export const startLiveEventEngine = (io) => {

    console.log(
        "Live event engine started"
    );


    // ----------------------------------------------------------
    // RUN EVERY 5 SECONDS
    // ----------------------------------------------------------

    setInterval(

        async () => {

            try {

                const products =
                    await Product.find();


                if (
                    products.length === 0
                ) {

                    console.log(
                        "No products available for live events"
                    );

                    return;

                }


                const randomProduct =
                    products[
                        Math.floor(
                            Math.random() *
                            products.length
                        )
                    ];


                // ------------------------------------------------
                // 25% CHANCE OF COMPLETE PURCHASE
                // ------------------------------------------------

                const purchaseJourney =
                    Math.random() < 0.25;


                if (purchaseJourney) {

                    await createPurchaseJourney(
                        randomProduct,
                        io
                    );

                } else {

                    await createRandomEvent(
                        products,
                        io
                    );

                }

            } catch (error) {

                console.error(
                    "Live event error:",
                    error.message
                );

            }

        },

        5000

    );

};