// ============================================================
// SHOPLYTICS - PRODUCT MODEL
// ============================================================

import mongoose from "mongoose";


// ============================================================
// PRODUCT SCHEMA
// ============================================================

const productSchema = new mongoose.Schema(
    {

        // ID coming from your e-commerce website
        externalId: {
            type: Number,
            required: true,
            unique: true
        },


        // Product name
        title: {
            type: String,
            required: true,
            trim: true
        },


        // Product price
        price: {
            type: Number,
            required: true,
            min: 0
        },


        // Product category
        category: {
            type: String,
            default: "Other"
        },


        // Product image
        thumbnail: {
            type: String,
            default: ""
        },


        // Brand
        brand: {
            type: String,
            default: ""
        },


        // Available stock
        stock: {
            type: Number,
            default: 0,
            min: 0
        }

    },

    {
        timestamps: true
    }
);


// ============================================================
// EXPORT PRODUCT MODEL
// ============================================================

// ============================================================
// EXPORT PRODUCT MODEL
// ============================================================

const Product =
    mongoose.models.Product ||
    mongoose.model(
        "Product",
        productSchema
    );

export default Product;
