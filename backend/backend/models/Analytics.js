const mongoose = require("mongoose");

const analyticsSchema = new mongoose.Schema({
    documentId: {
        type: String,
        required: true,
        unique: true
    },
    activeUsers: {
        type: Number,
        default: 0
    },
    totalEdits: {
        type: Number,
        default: 0
    },
    totalMessages: {
        type: Number,
        default: 0
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Analytics", analyticsSchema);

