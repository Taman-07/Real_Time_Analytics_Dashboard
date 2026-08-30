// ============================================================
// SHOPLYTICS - PRODUCT MODEL
// ============================================================

import mongoose from "mongoose";


// ============================================================
// SCHEMA
// ============================================================

const productSchema = new mongoose.Schema(
    {
        externalId: {
            type: Number,
            required: true,
            unique: true
        },

        title: {
            type: String,
            required: true,
            trim: true
        },

        price: {
            type: Number,
            required: true,
            min: 0
        },

        category: {
            type: String,
            default: "Other"
        },

        thumbnail: {
            type: String,
            default: ""
        },

        brand: {
            type: String,
            default: ""
        },

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
// MODEL
// ============================================================

const Product =
    mongoose.models.Product ||
    mongoose.model(
        "Product",
        productSchema
    );


// ============================================================
// EXPORT
// ============================================================

export default Product;
