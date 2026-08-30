import Product from "../models/Product.js";

const API_URL =
    "https://dummyjson.com/products?limit=0";


export const syncExternalProducts = async (io) => {

    try {

        console.log(
            "Fetching external e-commerce products..."
        );

        const response =
            await fetch(API_URL);

        if (!response.ok) {
            throw new Error(
                `External API error: ${response.status}`
            );
        }

        const data =
            await response.json();

        const products =
            data.products || [];

        for (const product of products) {

            await Product.findOneAndUpdate(
                {
                    externalId: product.id
                },
                {
                    externalId: product.id,

                    title: product.title,

                    price: product.price,

                    category:
                        product.category,

                    thumbnail:
                        product.thumbnail,

                    brand:
                        product.brand || "",

                    stock:
                        product.stock
                },
                {
                    upsert: true,

                    new: true,

                    setDefaultsOnInsert: true
                }
            );
        }

        console.log(
            `${products.length} products synchronized`
        );


        if (io) {

            io.emit(
                "productsUpdated",
                {
                    count:
                        products.length,

                    timestamp:
                        new Date()
                }
            );
        }

    } catch (error) {

        console.error(
            "External product sync error:",
            error.message
        );
    }
};