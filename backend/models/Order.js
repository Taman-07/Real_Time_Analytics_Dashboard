import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
    {
        externalId: {
            type: Number,
            required: true,
            unique: true
        },

        title: {
            type: String,
            required: true
        },

        price: {
            type: Number,
            required: true
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
            default: 0
        }
    },
    {
        timestamps: true
    }
);

export default mongoose.model(
    "Product",
    productSchema
);