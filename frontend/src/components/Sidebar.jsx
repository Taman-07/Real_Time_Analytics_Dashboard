import React from "react";

export default function Sidebar() {
  return (
    <div
      style={{
        width: "220px",
        height: "100vh",
        backgroundColor: "#2c3e50",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        padding: "20px",
      }}
    >
      <h2 style={{ marginBottom: "40px" }}>Dashboard</h2>
      <nav style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <a href="/" style={{ color: "#fff", textDecoration: "none" }}>Analytics</a>
        <a href="/" style={{ color: "#fff", textDecoration: "none" }}>Events</a>
        <a href="/" style={{ color: "#fff", textDecoration: "none" }}>Settings</a>
      </nav>
    </div>
  );
}