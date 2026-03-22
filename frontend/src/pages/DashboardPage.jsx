import React from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import AnalyticsDashboard from "../components/AnalyticsDashboard";

export default function DashboardPage() {
  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Topbar />
        <AnalyticsDashboard />
      </div>
    </div>
  );
}