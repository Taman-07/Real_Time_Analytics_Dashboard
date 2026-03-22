import mongoose from "mongoose";

const analyticsSchema = new mongoose.Schema({
  value: { type: Number, required: true }, // required
  timestamp: { type: Date, default: Date.now },
});

const Analytics = mongoose.model("Analytics", analyticsSchema);
export default Analytics;
