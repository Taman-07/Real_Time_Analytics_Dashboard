const mongoose = require("mongoose");

const logSchema = new mongoose.Schema({
    documentId: {
        type: String,
        required: true
    },
    event: {
        type: String,
        required: true
    },
    userId: {
        type: String
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("EventLog", logSchema);

