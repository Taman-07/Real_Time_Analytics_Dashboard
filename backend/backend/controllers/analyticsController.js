import Analytics from "../models/Analytics.js";

// GET /api/analytics
export const getAnalytics = async (req, res) => {
  try {
    const data = await Analytics.find().sort({ timestamp: 1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/analytics
export const addAnalytics = async (req, res) => {
  try {
    const { value } = req.body;

    if (value === undefined) {
      return res.status(400).json({ error: "Value is required" });
    }

    const newData = new Analytics({ value });
    await newData.save();

    // Emit real-time update
    if (req.io) req.io.emit("analytics_update", newData);

    res.status(201).json(newData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};