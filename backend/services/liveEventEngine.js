// ============================================================
// SHOPLYTICS - LIVE EVENT ENGINE
// ============================================================

import Product from "../models/Product.js";
import Event from "../models/Event.js";


// ============================================================
// FETCH PRODUCTS
// ============================================================

export const fetchProducts =
    async () => {

        try {

            console.log(
                "Fetching products..."
            );

            const products =
                await Product.find();

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

export const updateProduct =
    async (product) => {

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
// START LIVE EVENT ENGINE
// ============================================================

export const startLiveEventEngine =
    () => {

        console.log(
            "Live event engine started"
        );


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


                    const eventTypes = [

                        "PRODUCT_VIEWED",

                        "PRODUCT_ADDED_TO_CART",

                        "PRODUCT_SEARCHED",

                        "CHECKOUT_STARTED"

                    ];


                    const randomType =
                        eventTypes[
                            Math.floor(
                                Math.random() *
                                eventTypes.length
                            )
                        ];


                    const event =
                        await Event.create({

                            type:
                                randomType,

                            productId:
                                randomProduct.externalId,

                            productName:
                                randomProduct.title,

                            category:
                                randomProduct.category,

                            amount:
                                randomProduct.price,

                            metadata: {

                                source:
                                    "live-engine"

                            }

                        });


                    console.log(
                        "Live event:",
                        randomType,
                        "-",
                        randomProduct.title
                    );


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
    