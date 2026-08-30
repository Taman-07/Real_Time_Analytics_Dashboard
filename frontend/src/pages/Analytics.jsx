// ============================================================
// SHOPLYTICS - REAL-TIME ANALYTICS
// ============================================================

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    LayoutDashboard,
    ShoppingBag,
    ShoppingCart,
    Users,
    BarChart3,
    Settings,
    LogOut,
    Bell,
    TrendingUp,
    Package,
    CircleDollarSign,
    Activity,
    Search,
    Eye,
    CreditCard
} from "lucide-react";

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from "recharts";

import API from "../services/api";
import socket from "../services/socket";

import "../App.css";


// ============================================================
// ANALYTICS COMPONENT
// ============================================================

function Analytics() {

    const navigate = useNavigate();


    // =========================================================
    // STATE
    // =========================================================

    const [user, setUser] =
        useState(null);

    const [data, setData] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [liveEvents, setLiveEvents] =
        useState([]);


    // =========================================================
    // LOAD DASHBOARD
    // =========================================================

    useEffect(() => {

        const loadDashboard =
            async () => {

                try {

                    // =================================================
                    // CHECK AUTHENTICATION
                    // =================================================

                    const userResponse =
                        await API.get(
                            "/auth/me"
                        );


                    if (
                        !userResponse.data.success
                    ) {

                        navigate("/login");

                        return;

                    }


                    setUser(
                        userResponse.data.user
                    );


                    // =================================================
                    // GET ANALYTICS
                    // =================================================

                    const analyticsResponse =
                        await API.get(
                            "/analytics/dashboard"
                        );


                    if (
                        analyticsResponse.data.success
                    ) {

                        setData(
                            analyticsResponse.data
                        );

                    }

                } catch (err) {

                    console.error(
                        "Dashboard error:",
                        err
                    );


                    if (
                        err.response?.status === 401
                    ) {

                        navigate("/login");

                        return;

                    }


                    setError(
                        err.response?.data?.message ||
                        "Failed to load dashboard"
                    );

                } finally {

                    setLoading(false);

                }

            };


        loadDashboard();

    }, [navigate]);


    // =========================================================
    // REAL-TIME SOCKET.IO
    // =========================================================

    useEffect(() => {

        // =========================================================
        // SOCKET CONNECTED
        // =========================================================

        const handleConnect = () => {

            console.log(
                "Connected to Shoplytics:",
                socket.id
            );

        };


        // =========================================================
        // SOCKET DISCONNECTED
        // =========================================================

        const handleDisconnect = () => {

            console.log(
                "Disconnected from Shoplytics"
            );

        };


        // =========================================================
        // REAL-TIME ANALYTICS UPDATE
        // =========================================================

        const handleAnalyticsUpdate =
            async (update) => {

                console.log(
                    "🔥 REAL-TIME UPDATE:",
                    update
                );


                // =====================================================
                // ADD EVENT TO LIVE ACTIVITY
                // =====================================================

                if (
                    update?.event
                ) {

                    setLiveEvents(
                        (previousEvents) => {

                            const newEvents = [
                                {
                                    ...update.event,
                                    liveId:
                                        Date.now() +
                                        Math.random()
                                },
                                ...previousEvents
                            ];


                            return newEvents.slice(
                                0,
                                10
                            );

                        }
                    );

                }


                // =====================================================
                // REFRESH ANALYTICS
                // =====================================================

                try {

                    const response =
                        await API.get(
                            "/analytics/dashboard"
                        );


                    if (
                        response.data.success
                    ) {

                        setData(
                            response.data
                        );

                    }

                } catch (error) {

                    console.error(
                        "Realtime refresh error:",
                        error
                    );

                }

            };


        // =========================================================
        // REGISTER SOCKET EVENTS
        // =========================================================

        socket.on(
            "connect",
            handleConnect
        );


        socket.on(
            "disconnect",
            handleDisconnect
        );


        socket.on(
            "analyticsUpdated",
            handleAnalyticsUpdate
        );


        // =========================================================
        // CLEANUP
        // =========================================================

        return () => {

            socket.off(
                "connect",
                handleConnect
            );

            socket.off(
                "disconnect",
                handleDisconnect
            );

            socket.off(
                "analyticsUpdated",
                handleAnalyticsUpdate
            );

        };

    }, []);


    // =========================================================
    // LOGOUT
    // =========================================================

    const handleLogout =
        async () => {

            try {

                await API.post(
                    "/auth/logout"
                );


                socket.disconnect();


                navigate("/login");

            } catch (error) {

                console.error(
                    "Logout error:",
                    error
                );

            }

        };


    // =========================================================
    // LOADING
    // =========================================================

    if (loading) {

        return (

            <div className="dashboard-loading">

                <div className="loading-spinner"></div>

                <p>
                    Loading your analytics...
                </p>

            </div>

        );

    }


    // =========================================================
    // ERROR
    // =========================================================

    if (error) {

        return (

            <div className="dashboard-loading">

                <Activity size={35} />

                <p>
                    {error}
                </p>

                <button
                    onClick={() =>
                        window.location.reload()
                    }
                >
                    Try again
                </button>

            </div>

        );

    }


    if (!data) {

        return null;

    }


    // =========================================================
    // DATA
    // =========================================================

    const analytics =
        data.analytics || {};

    const orderStatus =
        data.orderStatus || {};

    const sales =
        data.sales || [];

    const orders =
        data.orders || [];

    const products =
        data.products || [];

    const eventStats =
        data.eventStats || [];


    // =========================================================
    // RENDER
    // =========================================================

    return (

        <div className="dashboard">


            {/* =================================================
                SIDEBAR
            ================================================= */}

            <aside className="sidebar">


                {/* LOGO */}

                <div className="sidebar-logo">

                    <div className="logo-icon">

                        <BarChart3
                            size={21}
                        />

                    </div>

                    <span>
                        Shoplytics
                    </span>

                </div>


                {/* MAIN MENU */}

                <div className="sidebar-section">

                    <p className="sidebar-title">
                        MAIN MENU
                    </p>


                    <button
                        className="sidebar-item active"
                    >

                        <LayoutDashboard
                            size={18}
                        />

                        <span>
                            Overview
                        </span>

                    </button>


                    <button
                        className="sidebar-item"
                    >

                        <BarChart3
                            size={18}
                        />

                        <span>
                            Analytics
                        </span>

                    </button>


                    <button
                        className="sidebar-item"
                    >

                        <ShoppingBag
                            size={18}
                        />

                        <span>
                            Products
                        </span>

                    </button>


                    <button
                        className="sidebar-item"
                    >

                        <ShoppingCart
                            size={18}
                        />

                        <span>
                            Orders
                        </span>

                    </button>


                    <button
                        className="sidebar-item"
                    >

                        <Users
                            size={18}
                        />

                        <span>
                            Customers
                        </span>

                    </button>

                </div>


                {/* BOTTOM */}

                <div className="sidebar-bottom">


                    <button
                        className="sidebar-item"
                    >

                        <Settings
                            size={18}
                        />

                        <span>
                            Settings
                        </span>

                    </button>


                    <button
                        className="sidebar-item logout-item"
                        onClick={handleLogout}
                    >

                        <LogOut
                            size={18}
                        />

                        <span>
                            Logout
                        </span>

                    </button>

                </div>

            </aside>


            {/* =================================================
                MAIN CONTENT
            ================================================= */}

            <main className="dashboard-main">


                {/* =================================================
                    HEADER
                ================================================= */}

                <header className="dashboard-header">


                    <div>

                        <h1>
                            Overview
                        </h1>

                        <p>
                            Here's what's happening
                            with your store today.
                        </p>

                    </div>


                    <div className="header-right">


                        {/* NOTIFICATION */}

                        <button
                            className="notification"
                        >

                            <Bell
                                size={19}
                            />

                            <span></span>

                        </button>


                        {/* USER */}

                        <div className="user-profile">


                            <div className="user-avatar">

                                {user?.firstName
                                    ?.charAt(0)
                                    ?.toUpperCase()
                                }

                            </div>


                            <div className="user-info">

                                <strong>

                                    {user?.firstName}

                                    {" "}

                                    {user?.lastName}

                                </strong>

                                <small>
                                    Admin
                                </small>

                            </div>

                        </div>

                    </div>

                </header>


                {/* =================================================
                    LIVE STATUS
                ================================================= */}

                <div className="live-status">

                    <span className="live-dot"></span>

                    <span>
                        Live analytics
                    </span>

                    <span className="live-divider">
                        •
                    </span>

                    <span>
                        Real-time updates enabled
                    </span>

                </div>


                {/* =================================================
                    STAT CARDS
                ================================================= */}

                <section className="stats-grid">


                    <StatCard
                        title="Total Revenue"
                        value={`₹${Number(
                            analytics.revenue || 0
                        ).toLocaleString("en-IN")}`}
                        growth={
                            analytics.revenueGrowth
                        }
                        icon={
                            <CircleDollarSign
                                size={21}
                            />
                        }
                    />


                    <StatCard
                        title="Total Orders"
                        value={
                            analytics.totalOrders || 0
                        }
                        growth={
                            analytics.orderGrowth
                        }
                        icon={
                            <ShoppingCart
                                size={21}
                            />
                        }
                    />


                    <StatCard
                        title="Customers"
                        value={
                            analytics.customers || 0
                        }
                        growth={
                            analytics.customerGrowth
                        }
                        icon={
                            <Users
                                size={21}
                            />
                        }
                    />


                    <StatCard
                        title="Products"
                        value={
                            analytics.products || 0
                        }
                        growth={
                            analytics.productGrowth
                        }
                        icon={
                            <Package
                                size={21}
                            />
                        }
                    />

                </section>


                {/* =================================================
                    SALES + ORDER STATUS
                ================================================= */}

                <section className="dashboard-grid">


                    {/* SALES */}

                    <div className="dashboard-card sales-card">


                        <div className="card-header">

                            <div>

                                <h3>
                                    Sales Overview
                                </h3>

                                <p>
                                    Revenue performance
                                </p>

                            </div>


                            <select>

                                <option>
                                    This week
                                </option>

                                <option>
                                    This month
                                </option>

                            </select>

                        </div>


                        <div className="chart-container">


                            {sales.length > 0 ? (

                                <ResponsiveContainer
                                    width="100%"
                                    height="100%"
                                >

                                    <LineChart
                                        data={sales}
                                    >

                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            vertical={false}
                                        />

                                        <XAxis
                                            dataKey="name"
                                        />

                                        <YAxis />

                                        <Tooltip />

                                        <Line
                                            type="monotone"
                                            dataKey="sales"
                                            strokeWidth={3}
                                            dot={{
                                                r: 4
                                            }}
                                            activeDot={{
                                                r: 6
                                            }}
                                        />

                                    </LineChart>

                                </ResponsiveContainer>

                            ) : (

                                <div className="empty-chart">

                                    <BarChart3
                                        size={35}
                                    />

                                    <p>
                                        No sales data yet
                                    </p>

                                </div>

                            )}

                        </div>

                    </div>


                    {/* ORDER STATUS */}

                    <div className="dashboard-card">


                        <div className="card-header">

                            <div>

                                <h3>
                                    Order Status
                                </h3>

                                <p>
                                    Current orders
                                </p>

                            </div>

                        </div>


                        <div className="status-list">

                            <StatusRow
                                label="Delivered"
                                value={
                                    orderStatus.delivered || 0
                                }
                            />

                            <StatusRow
                                label="Pending"
                                value={
                                    orderStatus.pending || 0
                                }
                            />

                            <StatusRow
                                label="Processing"
                                value={
                                    orderStatus.processing || 0
                                }
                            />

                            <StatusRow
                                label="Cancelled"
                                value={
                                    orderStatus.cancelled || 0
                                }
                            />

                        </div>

                    </div>

                </section>


                {/* =================================================
                    LIVE ACTIVITY
                ================================================= */}

                <section className="dashboard-card live-activity-card">


                    <div className="card-header">

                        <div>

                            <h3>
                                Live Activity
                            </h3>

                            <p>
                                Real-time customer activity
                            </p>

                        </div>


                        <div className="live-badge">

                            <span className="live-dot"></span>

                            LIVE

                        </div>

                    </div>


                    <div className="live-events">


                        {liveEvents.length === 0 ? (

                            <div className="empty-state">

                                <Activity
                                    size={28}
                                />

                                <p>
                                    Waiting for live activity...
                                </p>

                                <small>
                                    Events will appear here automatically
                                </small>

                            </div>

                        ) : (

                            liveEvents.map(
                                (event) => (

                                    <LiveEvent
                                        key={
                                            event.liveId
                                        }
                                        event={
                                            event
                                        }
                                    />

                                )
                            )

                        )}

                    </div>

                </section>


                {/* =================================================
                    EVENT STATISTICS
                ================================================= */}

                <section className="dashboard-card">


                    <div className="card-header">

                        <div>

                            <h3>
                                Customer Activity
                            </h3>

                            <p>
                                Event activity from your store
                            </p>

                        </div>

                    </div>


                    <div className="event-stats-grid">

                        {eventStats.map(
                            (event) => (

                                <EventStat
                                    key={
                                        event._id ||
                                        "unknown"
                                    }
                                    event={
                                        event
                                    }
                                />

                            )
                        )}

                    </div>

                </section>


                {/* =================================================
                    RECENT ORDERS + PRODUCTS
                ================================================= */}

                <section className="dashboard-grid">


                    {/* RECENT ORDERS */}

                    <div className="dashboard-card">


                        <div className="card-header">

                            <div>

                                <h3>
                                    Recent Orders
                                </h3>

                                <p>
                                    Latest transactions
                                </p>

                            </div>


                            <button className="view-all">
                                View all
                            </button>

                        </div>


                        <div className="orders-table">


                            {orders.length === 0 ? (

                                <div className="empty-state">
                                    No orders yet
                                </div>

                            ) : (

                                orders.map(
                                    (order) => (

                                        <div
                                            className="order-row"
                                            key={
                                                order._id
                                            }
                                        >

                                            <div>

                                                <strong>
                                                    {
                                                        order.orderId
                                                    }
                                                </strong>

                                                <small>
                                                    {
                                                        order.customerName
                                                    }
                                                </small>

                                            </div>


                                            <strong>

                                                ₹
                                                {Number(
                                                    order.totalAmount || 0
                                                ).toLocaleString(
                                                    "en-IN"
                                                )}

                                            </strong>


                                            <span
                                                className={
                                                    `order-status ${
                                                        order.status
                                                            ?.toLowerCase()
                                                    }`
                                                }
                                            >

                                                {
                                                    order.status
                                                }

                                            </span>

                                        </div>

                                    )
                                )

                            )}

                        </div>

                    </div>


                    {/* TOP PRODUCTS */}

                    <div className="dashboard-card">


                        <div className="card-header">

                            <div>

                                <h3>
                                    Top Products
                                </h3>

                                <p>
                                    Best performing products
                                </p>

                            </div>

                        </div>


                        <div className="product-list">


                            {products.length === 0 ? (

                                <div className="empty-state">
                                    No product sales yet
                                </div>

                            ) : (

                                products.map(
                                    (
                                        product,
                                        index
                                    ) => (

                                        <div
                                            className="product-row"
                                            key={
                                                product._id ||
                                                index
                                            }
                                        >

                                            <div className="product-number">
                                                {
                                                    index + 1
                                                }
                                            </div>


                                            <div className="product-info">

                                                <strong>
                                                    {
                                                        product.productName
                                                    }
                                                </strong>

                                                <small>
                                                    {
                                                        product.sales
                                                    }
                                                    {" "}
                                                    sales
                                                </small>

                                            </div>


                                            <strong>

                                                ₹
                                                {Number(
                                                    product.revenue || 0
                                                ).toLocaleString(
                                                    "en-IN"
                                                )}

                                            </strong>

                                        </div>

                                    )
                                )

                            )}

                        </div>

                    </div>

                </section>


            </main>

        </div>

    );

}


// ============================================================
// STAT CARD
// ============================================================

function StatCard({
    title,
    value,
    growth,
    icon
}) {

    return (

        <div className="stat-card">


            <div className="stat-top">


                <div className="stat-icon">

                    {icon}

                </div>


                <span className="stat-growth">

                    <TrendingUp
                        size={13}
                    />

                    {growth || 0}%

                </span>

            </div>


            <p>
                {title}
            </p>


            <h2>
                {value}
            </h2>


            <span className="stat-label">
                vs. previous period
            </span>

        </div>

    );

}


// ============================================================
// STATUS ROW
// ============================================================

function StatusRow({
    label,
    value
}) {

    return (

        <div className="status-row">


            <div className="status-label">

                <span
                    className={
                        `status-dot ${
                            label.toLowerCase()
                        }`
                    }
                ></span>

                {label}

            </div>


            <strong>
                {value}
            </strong>

        </div>

    );

}


// ============================================================
// LIVE EVENT
// ============================================================

function LiveEvent({
    event
}) {

    const getEventIcon = () => {

        switch (
            event.type
        ) {

            case "PRODUCT_VIEWED":

                return (
                    <Eye size={17} />
                );


            case "PRODUCT_SEARCHED":

                return (
                    <Search size={17} />
                );


            case "PRODUCT_ADDED_TO_CART":

                return (
                    <ShoppingCart
                        size={17}
                    />
                );


            case "CHECKOUT_STARTED":

                return (
                    <CreditCard
                        size={17}
                    />
                );


            case "PAYMENT_COMPLETED":

                return (
                    <CircleDollarSign
                        size={17}
                    />
                );


            case "ORDER_CREATED":

                return (
                    <ShoppingBag
                        size={17}
                    />
                );


            default:

                return (
                    <Activity size={17} />
                );

        }

    };


    const getEventText = () => {

        switch (
            event.type
        ) {

            case "PRODUCT_VIEWED":

                return (
                    <>
                        Someone viewed
                        {" "}
                        <strong>
                            {event.productName}
                        </strong>
                    </>
                );


            case "PRODUCT_SEARCHED":

                return (
                    <>
                        Product searched:
                        {" "}
                        <strong>
                            {event.productName}
                        </strong>
                    </>
                );


            case "PRODUCT_ADDED_TO_CART":

                return (
                    <>
                        Product added to cart:
                        {" "}
                        <strong>
                            {event.productName}
                        </strong>
                    </>
                );


            case "CHECKOUT_STARTED":

                return (
                    <>
                        Checkout started for
                        {" "}
                        <strong>
                            {event.productName}
                        </strong>
                    </>
                );


            case "PAYMENT_COMPLETED":

                return (
                    <>
                        Payment completed for
                        {" "}
                        <strong>
                            {event.orderId}
                        </strong>
                    </>
                );


            case "ORDER_CREATED":

                return (
                    <>
                        New order created:
                        {" "}
                        <strong>
                            {event.orderId}
                        </strong>
                    </>
                );


            default:

                return (
                    <>
                        New activity:
                        {" "}
                        <strong>
                            {event.type}
                        </strong>
                    </>
                );

        }

    };


    return (

        <div className="live-event-row">


            <div className="live-event-icon">

                {getEventIcon()}

            </div>


            <div className="live-event-content">

                <p>
                    {getEventText()}
                </p>

                <small>
                    Just now
                </small>

            </div>


            {event.amount && (

                <strong className="live-event-amount">

                    ₹
                    {Number(
                        event.amount
                    ).toLocaleString(
                        "en-IN"
                    )}

                </strong>

            )}

        </div>

    );

}


// ============================================================
// EVENT STAT
// ============================================================

function EventStat({
    event
}) {

    let icon = (
        <Activity size={18} />
    );


    if (
        event._id ===
        "PRODUCT_VIEWED"
    ) {

        icon = (
            <Eye size={18} />
        );

    }


    if (
        event._id ===
        "PRODUCT_SEARCHED"
    ) {

        icon = (
            <Search size={18} />
        );

    }


    if (
        event._id ===
        "PRODUCT_ADDED_TO_CART"
    ) {

        icon = (
            <ShoppingCart
                size={18}
            />
        );

    }


    if (
        event._id ===
        "CHECKOUT_STARTED"
    ) {

        icon = (
            <CreditCard
                size={18}
            />
        );

    }


    return (

        <div className="event-stat">


            <div className="event-stat-icon">

                {icon}

            </div>


            <div>

                <strong>
                    {event.count}
                </strong>

                <p>
                    {formatEventName(
                        event._id
                    )}
                </p>

            </div>

        </div>

    );

}


// ============================================================
// FORMAT EVENT NAME
// ============================================================

function formatEventName(
    eventName
) {

    if (!eventName) {

        return "Unknown";

    }


    return eventName
        .replaceAll(
            "_",
            " "
        )
        .toLowerCase()
        .replace(
            /\b\w/g,
            (letter) =>
                letter.toUpperCase()
        );

}


// ============================================================
// EXPORT
// ============================================================

export default Analytics;