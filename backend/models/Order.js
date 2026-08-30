// ============================================================
// SHOPLYTICS - ORDER MODEL
// ============================================================

import mongoose from "mongoose";


// ============================================================
// ORDER PRODUCT SCHEMA
// ============================================================

const orderProductSchema = new mongoose.Schema(
    {
        productId: {
            type: Number,
            required: true
        },

        productName: {
            type: String,
            required: true
        },

        quantity: {
            type: Number,
            required: true,
            default: 1
        },

        price: {
            type: Number,
            required: true
        }
    }
);


// ============================================================
// ORDER SCHEMA
// ============================================================

const orderSchema = new mongoose.Schema(
    {
        // ----------------------------------------------------
        // ORDER ID
        // ----------------------------------------------------

        orderId: {
            type: String,
            required: true,
            unique: true
        },


        // ----------------------------------------------------
        // CUSTOMER
        // ----------------------------------------------------

        customerName: {
            type: String,
            required: true
        },

        customerEmail: {
            type: String,
            required: true
        },


        // ----------------------------------------------------
        // PRODUCTS
        // ----------------------------------------------------

        products: {
            type: [orderProductSchema],
            required: true
        },


        // ----------------------------------------------------
        // TOTAL
        // ----------------------------------------------------

        totalAmount: {
            type: Number,
            required: true,
            default: 0
        },


        // ----------------------------------------------------
        // ORDER STATUS
        // ----------------------------------------------------

        status: {
            type: String,

            enum: [
                "Pending",
                "Processing",
                "Delivered",
                "Cancelled"
            ],

            default: "Pending"
        },


        // ----------------------------------------------------
        // PAYMENT STATUS
        // ----------------------------------------------------

        paymentStatus: {
            type: String,

            enum: [
                "Pending",
                "Paid",
                "Failed"
            ],

            default: "Pending"
        }
    },

    {
        timestamps: true
    }
);


// ============================================================
// EXPORT
// ============================================================

export default mongoose.model(
    "Order",
    orderSchema
);
