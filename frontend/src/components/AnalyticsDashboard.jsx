import React, { useEffect, useState } from "react";
import { getAnalyticsData } from "../services/api";
import AnalyticsChart from "./AnalyticsChart";
import AnalyticsCards from "./AnalyticsCards";
import { socket } from "../socket/socket";

export default function AnalyticsDashboard() {
  const [data, setData] = useState([]);

  useEffect(() => {
    getAnalyticsData()
      .then((res) => setData(res.data))
      .catch((err) => console.error(err));

    socket.on("analytics_update", (newData) => {
      setData((prev) => [...prev, newData]);
    });

    return () => socket.off("analytics_update");
  }, []);

  return (
    <div style={{ padding: "20px", flex: 1 }}>
      <AnalyticsCards data={data} />
      <AnalyticsChart data={data} />
    </div>
  );
}