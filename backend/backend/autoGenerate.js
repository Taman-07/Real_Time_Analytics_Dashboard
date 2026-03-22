import dotenv from "dotenv";
import mongoose from "mongoose";
import Analytics from "./models/Analytics.js";

dotenv.config();

const generateRandomData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected for auto-generator ✅");

    setInterval(async () => {
      const value = Math.floor(Math.random() * 100);
      const newData = new Analytics({ value });
      await newData.save();
      console.log("New analytics generated:", newData);

      // Emit via Socket.IO
      if (global.io) {
        global.io.emit("analytics_update", newData);
      }
    }, 5000);
  } catch (err) {
    console.error(err);
  }
};

generateRandomData();