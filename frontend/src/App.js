import React, { useEffect, useState } from "react";
import { socket } from "./socket/socket"; // import your Socket.IO client

function App() {
  const [messages, setMessages] = useState([]); // list of messages
  const [input, setInput] = useState(""); // current message typed

  useEffect(() => {
    // Listen for messages from backend
    socket.on("message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    // Cleanup on unmount
    return () => {
      socket.off("message");
    };
  }, []);

  // Function to send message to backend
  const sendMessage = () => {
    if (input.trim() === "") return; // don't send empty messages
    socket.emit("message", input); // send to backend
    setInput(""); // clear input box after sending
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Real-Time Chat</h1>

      {/* Message input */}
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type your message here"
        style={{ padding: "5px", width: "300px" }}
      />
      <button onClick={sendMessage} style={{ marginLeft: "10px" }}>
        Send Message
      </button>

      {/* Display messages */}
      <ul>
        {messages.map((msg, idx) => (
          <li key={idx}>{msg}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
