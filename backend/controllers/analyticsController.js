const Event = require("../models/Event");
const Document = require("../models/Document");


// ==========================================
// CREATE DOCUMENT
// ==========================================

const createDocument = async (req, res) => {
    try {
        const { title, description } = req.body;

        if (!title) {
            return res.status(400).json({
                success: false,
                message: "Document title is required"
            });
        }

        const document = await Document.create({
            title,
            description
        });

        res.status(201).json({
            success: true,
            message: "Document created successfully",
            document
        });

    } catch (error) {
        console.error("Create document error:", error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// ==========================================
// GET ALL DOCUMENTS
// ==========================================

const getDocuments = async (req, res) => {
    try {
        const documents = await Document.find()
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: documents.length,
            documents
        });

    } catch (error) {
        console.error("Get documents error:", error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// ==========================================
// CREATE EVENT
// ==========================================

const createEvent = async (req, res) => {
    try {
        const {
            documentId,
            eventType,
            userId,
            metadata
        } = req.body;

        if (!documentId || !eventType) {
            return res.status(400).json({
                success: false,
                message: "documentId and eventType are required"
            });
        }

        // Check document
        const document = await Document.findById(documentId);

        if (!document) {
            return res.status(404).json({
                success: false,
                message: "Document not found"
            });
        }

        // Save event
        const event = await Event.create({
            documentId,
            eventType,
            userId: userId || "anonymous",
            metadata: metadata || {}
        });

        // ======================================
        // CALCULATE UPDATED ANALYTICS
        // ======================================

        const totalEvents = await Event.countDocuments();

        const totalDocuments = await Document.countDocuments();

        const views = await Event.countDocuments({
            eventType: "view"
        });

        const opens = await Event.countDocuments({
            eventType: "open"
        });

        const edits = await Event.countDocuments({
            eventType: "edit"
        });

        const downloads = await Event.countDocuments({
            eventType: "download"
        });


        const analytics = {
            totalEvents,
            totalDocuments,
            views,
            opens,
            edits,
            downloads
        };


        // ======================================
        // SEND REAL-TIME UPDATE
        // ======================================

        const io = req.app.get("io");

        if (io) {
            io.emit("analyticsUpdated", {
                analytics,
                event
            });
        }


        // ======================================
        // RESPONSE
        // ======================================

        res.status(201).json({
            success: true,
            message: "Event logged successfully",
            event,
            analytics
        });

    } catch (error) {
        console.error("Create event error:", error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// ==========================================
// GET EVENTS
// ==========================================

const getEvents = async (req, res) => {
    try {

        const events = await Event.find()
            .populate("documentId", "title")
            .sort({ createdAt: -1 })
            .limit(100);

        res.status(200).json({
            success: true,
            count: events.length,
            events
        });

    } catch (error) {
        console.error("Get events error:", error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// ==========================================
// GET ANALYTICS
// ==========================================

const getAnalytics = async (req, res) => {
    try {

        const totalEvents = await Event.countDocuments();

        const totalDocuments = await Document.countDocuments();

        const views = await Event.countDocuments({
            eventType: "view"
        });

        const opens = await Event.countDocuments({
            eventType: "open"
        });

        const edits = await Event.countDocuments({
            eventType: "edit"
        });

        const downloads = await Event.countDocuments({
            eventType: "download"
        });


        res.status(200).json({
            success: true,
            analytics: {
                totalEvents,
                totalDocuments,
                views,
                opens,
                edits,
                downloads
            }
        });

    } catch (error) {
        console.error("Analytics error:", error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


module.exports = {
    createDocument,
    getDocuments,
    createEvent,
    getEvents,
    getAnalytics
};
