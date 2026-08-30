// ============================================================
// SHOPLYTICS - USER MODEL
// ============================================================

import mongoose from "mongoose";


// ============================================================
// USER SCHEMA
// ============================================================

const userSchema = new mongoose.Schema(

    {

        firstName: {
            type: String,
            required: true,
            trim: true,
            minlength: 2
        },

        lastName: {
            type: String,
            required: true,
            trim: true,
            minlength: 2
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        password: {
            type: String,
            required: true,
            minlength: 6
        }

    },

    {
        timestamps: true
    }

);


const User =
    mongoose.model(
        "User",
        userSchema
    );


export default User;