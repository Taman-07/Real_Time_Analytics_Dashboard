import express from "express";
import cors from "cors";
import analyticsRoutes from "./routes/analyticsRoutes.js";

const app = express();
app.use(cors());
app.use(express.json());

// attach io to req for sockets
app.use((req, res, next) => {
  req.io = req.app.get("io");
  next();
});

// routes
app.use("/api/analytics", analyticsRoutes);

export default app;