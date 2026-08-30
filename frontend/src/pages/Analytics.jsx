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
    TrendingDown,
    Package,
    CircleDollarSign,
    Activity
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

import "../App.css";


function Analytics() {

    const navigate = useNavigate();

    const [user, setUser] = useState(null);

    const [data, setData] = useState(null);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");


    // =========================================================
    // LOAD USER + ANALYTICS
    // =========================================================

    useEffect(() => {

        const loadDashboard = async () => {

            try {

                // Check authentication

                const userResponse =
                    await API.get("/auth/me");


                if (
                    !userResponse.data.success
                ) {

                    navigate("/login");

                    return;

                }


                setUser(
                    userResponse.data.user
                );


                // Get analytics

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
    // LOGOUT
    // =========================================================

    const handleLogout = async () => {

        try {

            await API.post(
                "/auth/logout"
            );

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


    const analytics =
        data.analytics;


    const orderStatus =
        data.orderStatus;


    const sales =
        data.sales || [];


    const orders =
        data.orders || [];


    const products =
        data.products || [];


    // =========================================================
    // DASHBOARD
    // =========================================================

    return (

        <div className="dashboard">


            {/* =================================================
                SIDEBAR
            ================================================= */}

            <aside className="sidebar">


                <div className="sidebar-logo">

                    <div className="logo-icon">
                        <BarChart3 size={21} />
                    </div>

                    <span>
                        Shoplytics
                    </span>

                </div>


                <div className="sidebar-section">

                    <p className="sidebar-title">
                        MAIN MENU
                    </p>


                    <button className="sidebar-item active">

                        <LayoutDashboard size={18} />

                        <span>
                            Overview
                        </span>

                    </button>


                    <button className="sidebar-item">

                        <BarChart3 size={18} />

                        <span>
                            Analytics
                        </span>

                    </button>


                    <button className="sidebar-item">

                        <ShoppingBag size={18} />

                        <span>
                            Products
                        </span>

                    </button>


                    <button className="sidebar-item">

                        <ShoppingCart size={18} />

                        <span>
                            Orders
                        </span>

                    </button>


                    <button className="sidebar-item">

                        <Users size={18} />

                        <span>
                            Customers
                        </span>

                    </button>

                </div>


                <div className="sidebar-bottom">


                    <button className="sidebar-item">

                        <Settings size={18} />

                        <span>
                            Settings
                        </span>

                    </button>


                    <button
                        className="sidebar-item logout-item"
                        onClick={handleLogout}
                    >

                        <LogOut size={18} />

                        <span>
                            Logout
                        </span>

                    </button>


                </div>

            </aside>


            {/* =================================================
                MAIN
            ================================================= */}

            <main className="dashboard-main">


                {/* HEADER */}

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


                        <button className="notification">

                            <Bell size={19} />

                            <span></span>

                        </button>


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
                        Updated just now
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
                            analytics.totalOrders
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
                            analytics.customers
                        }
                        growth={
                            analytics.customerGrowth
                        }
                        icon={
                            <Users size={21} />
                        }
                    />


                    <StatCard
                        title="Products"
                        value={
                            analytics.products
                        }
                        growth={
                            analytics.productGrowth
                        }
                        icon={
                            <Package size={21} />
                        }
                    />


                </section>


                {/* =================================================
                    CHART + ORDER STATUS
                ================================================= */}

                <section className="dashboard-grid">


                    {/* SALES CHART */}

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
                                    orderStatus.delivered
                                }
                            />


                            <StatusRow
                                label="Pending"
                                value={
                                    orderStatus.pending
                                }
                            />


                            <StatusRow
                                label="Processing"
                                value={
                                    orderStatus.processing
                                }
                            />


                            <StatusRow
                                label="Cancelled"
                                value={
                                    orderStatus.cancelled
                                }
                            />


                        </div>


                    </div>


                </section>


                {/* =================================================
                    RECENT ORDERS + TOP PRODUCTS
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

                                orders.map((order) => (

                                    <div
                                        className="order-row"
                                        key={order._id}
                                    >

                                        <div>

                                            <strong>
                                                {order.orderId}
                                            </strong>

                                            <small>
                                                {order.customerName}
                                            </small>

                                        </div>


                                        <strong>

                                            ₹
                                            {Number(
                                                order.totalAmount
                                            ).toLocaleString(
                                                "en-IN"
                                            )}

                                        </strong>


                                        <span
                                            className={
                                                `order-status ${order.status
                                                    ?.toLowerCase()
                                                }`
                                            }
                                        >
                                            {order.status}
                                        </span>

                                    </div>

                                ))

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
                                    (product, index) => (

                                        <div
                                            className="product-row"
                                            key={
                                                product._id ||
                                                index
                                            }
                                        >

                                            <div className="product-number">
                                                {index + 1}
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
                                                    product.revenue ||
                                                    0
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


// =============================================================
// STAT CARD
// =============================================================

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

                    <TrendingUp size={13} />

                    {growth}%

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


// =============================================================
// STATUS ROW
// =============================================================

function StatusRow({
    label,
    value
}) {

    return (

        <div className="status-row">

            <div className="status-label">

                <span className={
                    `status-dot ${label.toLowerCase()}`
                }></span>

                {label}

            </div>

            <strong>
                {value}
            </strong>

        </div>

    );

}


export default Analytics;