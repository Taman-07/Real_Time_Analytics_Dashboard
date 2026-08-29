const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
    {
        documentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Document",
            required: true
        },

        eventType: {
            type: String,
            required: true,
            enum: [
                "view",
                "open",
                "edit",
                "create",
                "delete",
                "download",
                "share"
            ]
        },

        userId: {
            type: String,
            default: "anonymous"
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

module.exports = mongoose.model("Event", eventSchema);