const express = require("express");
const router = express.Router();

const Analytics = require("../models/Analytics");
const EventLog = require("../models/EventLog");

// Get analytics for a document
router.get("/:docId", async (req, res) => {
    try {
        const data = await Analytics.findOne({ documentId: req.params.docId });
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get logs
router.get("/:docId/logs", async (req, res) => {
    try {
        const logs = await EventLog.find({ documentId: req.params.docId })
            .sort({ timestamp: -1 })
            .limit(20);

        res.json(logs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create analytics (TEST)
router.post("/create", async (req, res) => {
    try {
        const { documentId } = req.body;

        const data = await Analytics.create({
            documentId
        });

        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

