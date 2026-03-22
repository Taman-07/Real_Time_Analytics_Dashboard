// frontend/src/socket/socket.js
import { io } from "socket.io-client";

// Connect to backend socket server
export const socket = io("http://localhost:5000");

// Optional: handle connection events
socket.on("connect", () => {
  console.log("Connected to Socket.IO server:", socket.id);
});

socket.on("disconnect", () => {
  console.log("Disconnected from Socket.IO server");
});

