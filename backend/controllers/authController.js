// ============================================================
// SHOPLYTICS - AUTH CONTROLLER
// ============================================================

import bcrypt from "bcryptjs";
import User from "../models/User.js";


// ============================================================
// SIGN UP
// ============================================================

export const signup = async (req, res) => {

    try {

        const {
            firstName,
            lastName,
            email,
            password
        } = req.body;


        // ----------------------------------------------------
        // VALIDATION
        // ----------------------------------------------------

        if (
            !firstName ||
            !lastName ||
            !email ||
            !password
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "All fields are required"

            });

        }


        if (firstName.trim().length < 2) {

            return res.status(400).json({

                success: false,

                message:
                    "First name must contain at least 2 characters"

            });

        }


        if (lastName.trim().length < 2) {

            return res.status(400).json({

                success: false,

                message:
                    "Last name must contain at least 2 characters"

            });

        }


        if (password.length < 6) {

            return res.status(400).json({

                success: false,

                message:
                    "Password must contain at least 6 characters"

            });

        }


        // ----------------------------------------------------
        // CHECK EXISTING USER
        // ----------------------------------------------------

        const existingUser =
            await User.findOne({
                email: email.toLowerCase()
            });


        if (existingUser) {

            return res.status(409).json({

                success: false,

                message:
                    "User with this email already exists"

            });

        }


        // ----------------------------------------------------
        // HASH PASSWORD
        // ----------------------------------------------------

        const hashedPassword =
            await bcrypt.hash(
                password,
                10
            );


        // ----------------------------------------------------
        // CREATE USER
        // ----------------------------------------------------

        const user =
            await User.create({

                firstName:
                    firstName.trim(),

                lastName:
                    lastName.trim(),

                email:
                    email.toLowerCase().trim(),

                password:
                    hashedPassword

            });


        // ----------------------------------------------------
        // CREATE SESSION
        // ----------------------------------------------------

        req.session.userId =
            user._id.toString();


        return res.status(201).json({

            success: true,

            message:
                "Account created successfully",

            user: {

                id:
                    user._id,

                firstName:
                    user.firstName,

                lastName:
                    user.lastName,

                email:
                    user.email

            }

        });


    } catch (error) {

        console.error(
            "SIGNUP ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to create account"

        });

    }

};



// ============================================================
// LOGIN
// ============================================================

export const login = async (req, res) => {

    try {

        const {
            email,
            password
        } = req.body;


        // ----------------------------------------------------
        // VALIDATION
        // ----------------------------------------------------

        if (!email || !password) {

            return res.status(400).json({

                success: false,

                message:
                    "Email and password are required"

            });

        }


        // ----------------------------------------------------
        // FIND USER
        // ----------------------------------------------------

        const user =
            await User.findOne({

                email:
                    email.toLowerCase().trim()

            });


        if (!user) {

            return res.status(401).json({

                success: false,

                message:
                    "Invalid email or password"

            });

        }


        // ----------------------------------------------------
        // CHECK PASSWORD
        // ----------------------------------------------------

        const passwordMatch =
            await bcrypt.compare(
                password,
                user.password
            );


        if (!passwordMatch) {

            return res.status(401).json({

                success: false,

                message:
                    "Invalid email or password"

            });

        }


        // ----------------------------------------------------
        // CREATE SESSION
        // ----------------------------------------------------

        req.session.userId =
            user._id.toString();


        return res.json({

            success: true,

            message:
                "Login successful",

            user: {

                id:
                    user._id,

                firstName:
                    user.firstName,

                lastName:
                    user.lastName,

                email:
                    user.email

            }

        });


    } catch (error) {

        console.error(
            "LOGIN ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to login"

        });

    }

};



// ============================================================
// LOGOUT
// ============================================================

export const logout = (req, res) => {

    req.session.destroy((error) => {

        if (error) {

            console.error(
                "LOGOUT ERROR:",
                error
            );

            return res.status(500).json({

                success: false,

                message:
                    "Failed to logout"

            });

        }


        res.clearCookie("connect.sid");


        return res.json({

            success: true,

            message:
                "Logout successful"

        });

    });

};



// ============================================================
// CURRENT USER
// ============================================================

export const getCurrentUser = async (req, res) => {

    try {

        if (!req.session.userId) {

            return res.status(401).json({

                success: false,

                message:
                    "Not authenticated"

            });

        }


        const user =
            await User.findById(
                req.session.userId
            ).select("-password");


        if (!user) {

            return res.status(404).json({

                success: false,

                message:
                    "User not found"

            });

        }


        return res.json({

            success: true,

            user

        });


    } catch (error) {

        console.error(
            "CURRENT USER ERROR:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to fetch user"

        });

    }

};