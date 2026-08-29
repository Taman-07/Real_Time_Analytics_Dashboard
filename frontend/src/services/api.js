import axios from "axios";

const API = axios.create({
    baseURL: "http://localhost:5000/api/analytics"
});

export const getAnalytics = async () => {
    const response = await API.get("/analytics");
    return response.data;
};

export const getEvents = async () => {
    const response = await API.get("/events");
    return response.data;
};

export const getDocuments = async () => {
    const response = await API.get("/documents");
    return response.data;
};

export const createDocument = async (documentData) => {
    const response = await API.post(
        "/documents",
        documentData
    );

    return response.data;
};

export const createEvent = async (eventData) => {
    const response = await API.post(
        "/events",
        eventData
    );

    return response.data;
};