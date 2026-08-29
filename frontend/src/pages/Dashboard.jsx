import { useEffect, useState } from "react";

import {
    getAnalytics,
    getEvents,
    getDocuments
} from "../services/api";

import socket from "../services/socket";

import Sidebar from "../components/Sidebar";
import StatCard from "../components/StatCard";
import AnalyticsChart from "../components/AnalyticsChart";
import LiveEvents from "../components/LiveEvents";
import DocumentTable from "../components/DocumentTable";


function Dashboard() {

    const [analytics, setAnalytics] = useState({
        totalEvents: 0,
        totalDocuments: 0,
        views: 0,
        opens: 0,
        edits: 0,
        downloads: 0
    });


    const [events, setEvents] = useState([]);

    const [documents, setDocuments] = useState([]);


    // =====================================
    // LOAD INITIAL DATA
    // =====================================

    useEffect(() => {

        const loadDashboard = async () => {

            try {

                const [
                    analyticsData,
                    eventsData,
                    documentsData
                ] = await Promise.all([

                    getAnalytics(),
                    getEvents(),
                    getDocuments()

                ]);


                setAnalytics(
                    analyticsData.analytics
                );


                setEvents(
                    eventsData.events
                );


                setDocuments(
                    documentsData.documents
                );

            } catch (error) {

                console.error(
                    "Dashboard loading error:",
                    error
                );

            }

        };


        loadDashboard();

    }, []);


    // =====================================
    // REAL-TIME UPDATES
    // =====================================

    useEffect(() => {

        const handleUpdate = (data) => {

            console.log(
                "Real-time analytics:",
                data
            );


            setAnalytics(
                data.analytics
            );


            setEvents((previous) => [

                data.event,
                ...previous

            ]);

        };


        socket.on(
            "analyticsUpdated",
            handleUpdate
        );


        return () => {

            socket.off(
                "analyticsUpdated",
                handleUpdate
            );

        };

    }, []);


    return (

        <div className="dashboard">

            <Sidebar />


            <main className="main-content">


                {/* HEADER */}

                <header className="dashboard-header">

                    <div>

                        <p className="eyebrow">
                            ANALYTICS
                        </p>

                        <h1>
                            Real-Time Dashboard
                        </h1>

                        <p className="subtitle">
                            Monitor your application activity
                            in real time.
                        </p>

                    </div>


                    <div className="connection-status">

                        <span className="status-dot"></span>

                        LIVE

                    </div>

                </header>


                {/* STATS */}

                <section className="stats-grid">

                    <StatCard
                        title="Total Events"
                        value={analytics.totalEvents}
                        type="events"
                    />

                    <StatCard
                        title="Documents"
                        value={analytics.totalDocuments}
                        type="documents"
                    />

                    <StatCard
                        title="Total Views"
                        value={analytics.views}
                        type="views"
                    />

                    <StatCard
                        title="Total Edits"
                        value={analytics.edits}
                        type="edits"
                    />

                    <StatCard
                        title="Downloads"
                        value={analytics.downloads}
                        type="downloads"
                    />

                </section>


                {/* CHART */}

                <section className="chart-section">

                    <AnalyticsChart
                        events={events}
                    />

                </section>


                {/* BOTTOM */}

                <section className="bottom-grid">

                    <DocumentTable
                        documents={documents}
                    />

                    <LiveEvents
                        events={events}
                    />

                </section>


            </main>

        </div>
    );
}


export default Dashboard;