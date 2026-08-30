// ============================================================
// SHOPLYTICS - EVENT MODEL
// ============================================================

import mongoose from "mongoose";


const eventSchema = new mongoose.Schema(
    {

        type: {
            type: String,
            required: true,

            enum: [
                "PRODUCT_VIEWED",
                "PRODUCT_SEARCHED",
                "PRODUCT_ADDED_TO_CART",
                "CHECKOUT_STARTED",
                "ORDER_CREATED",
                "PAYMENT_COMPLETED",
                "ORDER_CANCELLED",
                "USER_REGISTERED",
                "PRODUCT_PURCHASED"
            ]
        },


        productId: {
            type: Number,
            default: null
        },


        productName: {
            type: String,
            default: null
        },


        userId: {
            type: String,
            default: null
        },


        orderId: {
            type: String,
            default: null
        },


        amount: {
            type: Number,
            default: 0
        },


        category: {
            type: String,
            default: null
        },


        metadata: {
            type: mongoose.Schema.Types.Mixed,
            default: {}
        }

    },

    {
        timestamps: true
    }
);


const Event =
    mongoose.model(
        "Event",
        eventSchema
    );


export default Event;
