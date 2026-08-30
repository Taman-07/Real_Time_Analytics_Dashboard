// ============================================================
// SHOPLYTICS - ORDER MODEL
// ============================================================

import mongoose from "mongoose";


// ============================================================
// ORDER SCHEMA
// ============================================================

const orderSchema = new mongoose.Schema(

    {

        // ----------------------------------------------------
        // UNIQUE ORDER ID
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
            required: true,
            trim: true
        },


        customerEmail: {
            type: String,
            default: "",
            trim: true
        },


        // ----------------------------------------------------
        // PRODUCTS IN ORDER
        // ----------------------------------------------------

        products: [

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
                    min: 1
                },

                price: {
                    type: Number,
                    required: true,
                    min: 0
                }

            }

        ],


        // ----------------------------------------------------
        // TOTAL ORDER AMOUNT
        // ----------------------------------------------------

        totalAmount: {
            type: Number,
            required: true,
            min: 0
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
// EXPORT MODEL
// ============================================================

const Order =
    mongoose.model(
        "Order",
        orderSchema
    );


export default Order;
