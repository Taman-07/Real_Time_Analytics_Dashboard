const express = require("express");

const {
    createDocument,
    getDocuments,
    createEvent,
    getEvents,
    getAnalytics
} = require("../controllers/analyticsController");

const router = express.Router();


// Documents
router.post("/documents", createDocument);

router.get("/documents", getDocuments);


// Events
router.post("/events", createEvent);

router.get("/events", getEvents);


// Analytics
router.get("/analytics", getAnalytics);


module.exports = router;