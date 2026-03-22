import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

export const getAnalyticsData = () => API.get("/analytics");
export const postAnalyticsData = (value) => API.post("/analytics", { value });
