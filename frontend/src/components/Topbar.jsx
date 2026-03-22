import React from "react";

export default function Topbar() {
  return (
    <div
      style={{
        height: "60px",
        width: "100%",
        backgroundColor: "#ecf0f1",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 20px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      }}
    >
      <h3>Real-Time Analytics Dashboard</h3>
      <div>User</div>
    </div>
  );
}