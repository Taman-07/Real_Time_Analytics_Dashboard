import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { createServer } from "http";
import { Server } from "socket.io";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.send("Hello World! Backend is running!");
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB connected"))
.catch(err => console.error("MongoDB error:", err));

// Setup Socket.IO
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "*" } // allow all origins for testing
});

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  // Send welcome message
  socket.emit("message", "Welcome to Socket.IO server!");

  // 🔹 Listen for messages from frontend
  socket.on("message", (msg) => {
    console.log("Message from frontend:", msg);

    // Optional: broadcast to all clients (including sender)
    io.emit("message", msg);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Start server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));