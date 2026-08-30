import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import { io } from "socket.io-client";

import {
  Activity,
  BarChart3,
  Bell,
  CircleDollarSign,
  CreditCard,
  Eye,
  LayoutDashboard,
  LogOut,
  Package,
  Search,
  ShoppingCart,
  TrendingUp,
  Users,
} from "lucide-react";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

import API from "../services/api";

// ============================================================
// CONFIG
// ============================================================

const SOCKET_URL = "http://localhost:5000";

const COLORS = [
  "#00d9ff",
  "#5865f2",
  "#8b5cf6",
  "#ff3b81",
];

// ============================================================
// ANALYTICS COMPONENT
// ============================================================

function Analytics() {
  const navigate = useNavigate();

  // ==========================================================
  // STATE
  // ==========================================================

  const [user, setUser] = useState(null);
  const [data, setData] = useState(null);
  const [liveEvents, setLiveEvents] = useState([]);
  const [isLive, setIsLive] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================================
  // REFRESH ANALYTICS
  // ==========================================================

  const refreshAnalytics = useCallback(async () => {
    try {
      const response = await API.get("/analytics/dashboard");

      if (response.data?.success) {
        setData(response.data);
        setLastUpdate(new Date());
      }
    } catch (err) {
      console.error("Analytics refresh error:", err);
    }
  }, []);

  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    let mounted = true;

    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        // ----------------------------------------------------
        // CHECK LOGIN
        // ----------------------------------------------------

        const userResponse = await API.get("/auth/me");

        if (!userResponse.data?.success) {
          navigate("/login");
          return;
        }

        if (mounted) {
          setUser(userResponse.data.user);
        }

        // ----------------------------------------------------
        // LOAD ANALYTICS
        // ----------------------------------------------------

        await refreshAnalytics();
      } catch (err) {
        console.error("Dashboard error:", err);

        if (err.response?.status === 401) {
          navigate("/login");
          return;
        }

        if (mounted) {
          setError(
            err.response?.data?.message ||
              "Unable to load analytics dashboard"
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      mounted = false;
    };
  }, [navigate, refreshAnalytics]);

  // ==========================================================
  // SOCKET.IO
  // ==========================================================

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ["websocket", "polling"],
    });

    // --------------------------------------------------------
    // CONNECT
    // --------------------------------------------------------

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
      setIsLive(true);
    });

    // --------------------------------------------------------
    // SERVER CONNECTED EVENT
    // --------------------------------------------------------

    socket.on("connected", (payload) => {
      console.log("Server:", payload);
      setIsLive(true);
    });

    // --------------------------------------------------------
    // DISCONNECT
    // --------------------------------------------------------

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
      setIsLive(false);
    });

    // --------------------------------------------------------
    // CONNECTION ERROR
    // --------------------------------------------------------

    socket.on("connect_error", (err) => {
      console.error(
        "Socket connection error:",
        err.message
      );

      setIsLive(false);
    });

    // --------------------------------------------------------
    // LIVE ANALYTICS UPDATE
    // --------------------------------------------------------

    socket.on(
      "analyticsUpdated",
      async (payload) => {
        console.log(
          "LIVE ANALYTICS UPDATE:",
          payload
        );

        // Add event immediately
        if (payload?.event) {
          setLiveEvents((previous) => [
            payload.event,
            ...previous,
          ].slice(0, 12));
        }

        // Refresh dashboard
        await refreshAnalytics();

        setLastUpdate(new Date());
      }
    );

    // --------------------------------------------------------
    // DIRECT LIVE EVENT
    // --------------------------------------------------------

    socket.on("liveEvent", (event) => {
      console.log("LIVE EVENT:", event);

      if (!event) return;

      setLiveEvents((previous) => [
        event,
        ...previous,
      ].slice(0, 12));

      setLastUpdate(new Date());
    });

    // --------------------------------------------------------
    // CLEANUP
    // --------------------------------------------------------

    return () => {
      socket.off("connect");
      socket.off("connected");
      socket.off("disconnect");
      socket.off("connect_error");
      socket.off("analyticsUpdated");
      socket.off("liveEvent");

      socket.disconnect();
    };
  }, [refreshAnalytics]);

  // ==========================================================
  // LOGOUT
  // ==========================================================

  const handleLogout = async () => {
    try {
      await API.post("/auth/logout");

      navigate("/login");
    } catch (err) {
      console.error("Logout error:", err);

      navigate("/login");
    }
  };

  // ==========================================================
  // SAFE DATA
  // ==========================================================

  const analytics = data?.analytics || {};

  const orderStatus = data?.orderStatus || {};

  const sales = data?.sales || [];

  const orders = data?.orders || [];

  const topProducts = data?.products || [];

  // ==========================================================
  // SALES CHART DATA
  // ==========================================================

  const salesChartData = useMemo(() => {
    if (sales.length > 0) {
      return sales.map((item) => ({
        name:
          item.name ||
          item.date ||
          "Day",

        sales: Number(
          item.sales ||
            item.revenue ||
            0
        ),
      }));
    }

    return [
      {
        name: "Mon",
        sales: 0,
      },
      {
        name: "Tue",
        sales: 0,
      },
      {
        name: "Wed",
        sales: 0,
      },
      {
        name: "Thu",
        sales: 0,
      },
      {
        name: "Fri",
        sales: 0,
      },
      {
        name: "Sat",
        sales: 0,
      },
      {
        name: "Sun",
        sales: 0,
      },
    ];
  }, [sales]);

  // ==========================================================
  // ORDER STATUS DATA
  // ==========================================================

  const orderStatusChart = useMemo(
    () => [
      {
        name: "Delivered",
        value: Number(
          orderStatus.delivered || 0
        ),
      },

      {
        name: "Pending",
        value: Number(
          orderStatus.pending || 0
        ),
      },

      {
        name: "Processing",
        value: Number(
          orderStatus.processing || 0
        ),
      },

      {
        name: "Cancelled",
        value: Number(
          orderStatus.cancelled || 0
        ),
      },
    ],
    [orderStatus]
  );

  // ==========================================================
  // PRODUCT PERFORMANCE CHART
  // ==========================================================

  const productChartData = useMemo(() => {
    return topProducts
      .slice(0, 6)
      .map((product) => ({
        name:
          product.productName ||
          product.title ||
          "Product",

        sales: Number(
          product.sales || 0
        ),
      }));
  }, [topProducts]);

  // ==========================================================
  // FORMAT TIME
  // ==========================================================

  const formatTime = (date) => {
    if (!date) {
      return "Waiting...";
    }

    return new Date(date).toLocaleTimeString(
      [],
      {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }
    );
  };

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <>
        <style>{dashboardCSS}</style>

        <div className="analytics-loading">
          <div className="loading-ring"></div>

          <h2>
            Loading Shoplytics
          </h2>

          <p>
            Connecting to your analytics...
          </p>
        </div>
      </>
    );
  }

  // ==========================================================
  // ERROR
  // ==========================================================

  if (error) {
    return (
      <>
        <style>{dashboardCSS}</style>

        <div className="analytics-loading">
          <Activity size={50} />

          <h2>
            Something went wrong
          </h2>

          <p>{error}</p>

          <button
            className="retry-btn"
            onClick={() =>
              window.location.reload()
            }
          >
            Try Again
          </button>
        </div>
      </>
    );
  }

  // ==========================================================
  // NO DATA
  // ==========================================================

  if (!data) {
    return (
      <>
        <style>{dashboardCSS}</style>

        <div className="analytics-loading">
          <Activity size={50} />

          <h2>
            No analytics data
          </h2>

          <p>
            Waiting for dashboard data...
          </p>
        </div>
      </>
    );
  }

  // ==========================================================
  // MAIN DASHBOARD
  // ==========================================================

  return (
    <>
      <style>{dashboardCSS}</style>

      <div className="analytics-page">

        {/* ==================================================
            SIDEBAR
        ================================================== */}

        <aside className="analytics-sidebar">

          {/* BRAND */}

          <div className="brand">

            <div className="brand-icon">
              <BarChart3 size={23} />
            </div>

            <div>
              <h2>
                Shoplytics
              </h2>

              <span>
                Real-Time Analytics
              </span>
            </div>

          </div>

          <div className="sidebar-label">
            DASHBOARD
          </div>

          {/* OVERVIEW */}

          <button
            className="sidebar-link active"
            onClick={() =>
              window.scrollTo({
                top: 0,
                behavior: "smooth",
              })
            }
          >
            <LayoutDashboard size={18} />

            <span>
              Overview
            </span>
          </button>

          {/* ANALYTICS */}

          <button
            className="sidebar-link"
            onClick={() =>
              document
                .getElementById(
                  "sales-section"
                )
                ?.scrollIntoView({
                  behavior: "smooth",
                })
            }
          >
            <BarChart3 size={18} />

            <span>
              Analytics
            </span>
          </button>

          {/* ORDERS */}

          <button
            className="sidebar-link"
            onClick={() =>
              document
                .getElementById(
                  "orders-section"
                )
                ?.scrollIntoView({
                  behavior: "smooth",
                })
            }
          >
            <ShoppingCart size={18} />

            <span>
              Orders
            </span>
          </button>

          {/* CUSTOMERS */}

          <button
            className="sidebar-link"
            onClick={() =>
              document
                .getElementById(
                  "customers-section"
                )
                ?.scrollIntoView({
                  behavior: "smooth",
                })
            }
          >
            <Users size={18} />

            <span>
              Customers
            </span>
          </button>

          {/* SIDEBAR BOTTOM */}

          <div className="sidebar-bottom">

            <div className="sidebar-system">

              <span
                className={
                  isLive
                    ? "system-dot online"
                    : "system-dot"
                }
              ></span>

              <div>

                <strong>
                  System
                </strong>

                <small>
                  {isLive
                    ? "Connected"
                    : "Offline"}
                </small>

              </div>

            </div>

            <button
              className="sidebar-link logout"
              onClick={handleLogout}
            >
              <LogOut size={18} />

              <span>
                Logout
              </span>
            </button>

          </div>

        </aside>

        {/* ==================================================
            MAIN
        ================================================== */}

        <main className="analytics-main">

          {/* ==================================================
              HEADER
          ================================================== */}

          <header className="analytics-header">

            <div>

              <div className="page-badge">

                <Activity size={14} />

                REAL-TIME DASHBOARD

              </div>

              <h1>
                Analytics Overview
              </h1>

              <p>
                Monitor your e-commerce
                performance in real time.
              </p>

            </div>

            <div className="header-actions">

              <button
                className="notification-btn"
              >
                <Bell size={19} />

                <span className="notification-dot"></span>
              </button>

              <div className="profile-box">

                <div className="avatar">

                  {user?.firstName
                    ?.charAt(0)
                    ?.toUpperCase() || "A"}

                </div>

                <div>

                  <strong>

                    {user?.firstName ||
                      "Admin"}

                    {" "}

                    {user?.lastName || ""}

                  </strong>

                  <small>
                    Administrator
                  </small>

                </div>

              </div>

            </div>

          </header>

          {/* ==================================================
              LIVE BAR
          ================================================== */}

          <div className="live-bar">

            <div className="live-left">

              <span
                className={
                  isLive
                    ? "live-dot"
                    : "offline-dot"
                }
              ></span>

              <strong
                className={
                  isLive
                    ? "live-status"
                    : "offline-status"
                }
              >
                {isLive
                  ? "LIVE"
                  : "OFFLINE"}
              </strong>

              <span>
                Real-time updates enabled
              </span>

            </div>

            <div className="last-update">

              Last update:{" "}

              {formatTime(
                lastUpdate
              )}

            </div>

          </div>

          {/* ==================================================
              STAT CARDS
          ================================================== */}

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
                <CircleDollarSign />
              }
            />

            <StatCard
              title="Total Orders"
              value={
                analytics.totalOrders ||
                0
              }
              growth={
                analytics.orderGrowth
              }
              icon={
                <ShoppingCart />
              }
            />

            <StatCard
              title="Customers"
              value={
                analytics.customers ||
                0
              }
              growth={
                analytics.customerGrowth
              }
              icon={
                <Users />
              }
            />

            <StatCard
              title="Products"
              value={
                analytics.products ||
                0
              }
              growth={
                analytics.productGrowth
              }
              icon={
                <Package />
              }
            />

          </section>

          {/* ==================================================
              LIVE ACTIVITY
          ================================================== */}

          <section className="glass-card activity-card">

            <div className="section-header">

              <div>

                <h2>
                  Live Activity
                </h2>

                <p>
                  Real-time customer events
                  from your event engine
                </p>

              </div>

              <div className="live-pill">

                <span
                  className={
                    isLive
                      ? "pulse"
                      : ""
                  }
                ></span>

                {isLive
                  ? "LIVE"
                  : "OFFLINE"}

              </div>

            </div>

            <div className="activity-list">

              {liveEvents.length === 0 ? (

                <div className="empty-activity">

                  <Activity size={40} />

                  <h3>
                    Waiting for live activity
                  </h3>

                  <p>
                    Events generated by the
                    live engine will appear here.
                  </p>

                </div>

              ) : (

                liveEvents.map(
                  (event, index) => (

                    <div
                      className="activity-row"
                      key={
                        event._id ||
                        `${event.type}-${index}`
                      }
                    >

                      <div className="activity-icon">

                        {getEventIcon(
                          event.type
                        )}

                      </div>

                      <div className="activity-content">

                        <strong>
                          {formatEventType(
                            event.type
                          )}
                        </strong>

                        <span>

                          {event.productName ||
                            event.product?.title ||
                            event.orderId ||
                            "Customer activity"}

                        </span>

                      </div>

                      <div className="activity-right">

                        <strong>

                          {event.amount
                            ? `₹${Number(
                                event.amount
                              ).toLocaleString(
                                "en-IN"
                              )}`
                            : "LIVE"}

                        </strong>

                        <small>

                          {formatTime(
                            event.createdAt ||
                              event.timestamp
                          )}

                        </small>

                      </div>

                    </div>

                  )
                )

              )}

            </div>

          </section>

          {/* ==================================================
              CHARTS
          ================================================== */}

          <section
            id="sales-section"
            className="charts-grid"
          >

            {/* SALES */}

            <div className="glass-card chart-card large-chart">

              <div className="section-header">

                <div>

                  <h2>
                    Sales Overview
                  </h2>

                  <p>
                    Revenue performance over time
                  </p>

                </div>

                <div className="chart-tag">

                  <TrendingUp size={14} />

                  Revenue

                </div>

              </div>

              <div className="chart-wrapper">

                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >

                  <LineChart
                    data={
                      salesChartData
                    }
                  >

                    <CartesianGrid
                      stroke="#1e293b"
                      strokeDasharray="4 4"
                      vertical={false}
                    />

                    <XAxis
                      dataKey="name"
                      stroke="#64748b"
                      tickLine={false}
                      axisLine={false}
                    />

                    <YAxis
                      stroke="#64748b"
                      tickLine={false}
                      axisLine={false}
                    />

                    <Tooltip
                      contentStyle={{
                        background:
                          "#0b1220",
                        border:
                          "1px solid #164e63",
                        borderRadius:
                          "12px",
                        color: "#fff",
                      }}
                      formatter={(value) => [
                        `₹${Number(
                          value
                        ).toLocaleString(
                          "en-IN"
                        )}`,
                        "Sales",
                      ]}
                    />

                    <Line
                      type="monotone"
                      dataKey="sales"
                      stroke="#00d9ff"
                      strokeWidth={3}
                      dot={{
                        r: 4,
                        fill: "#00d9ff",
                        stroke:
                          "#020617",
                        strokeWidth: 2,
                      }}
                      activeDot={{
                        r: 7,
                      }}
                    />

                  </LineChart>

                </ResponsiveContainer>

              </div>

            </div>

            {/* ORDER STATUS */}

            <div className="glass-card chart-card">

              <div className="section-header">

                <div>

                  <h2>
                    Order Status
                  </h2>

                  <p>
                    Current order distribution
                  </p>

                </div>

              </div>

              <div className="pie-wrapper">

                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >

                  <PieChart>

                    <Pie
                      data={
                        orderStatusChart
                      }
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="45%"
                      innerRadius={65}
                      outerRadius={105}
                      paddingAngle={5}
                    >

                      {orderStatusChart.map(
                        (_, index) => (

                          <Cell
                            key={index}
                            fill={
                              COLORS[
                                index %
                                  COLORS.length
                              ]
                            }
                          />

                        )
                      )}

                    </Pie>

                    <Tooltip
                      contentStyle={{
                        background:
                          "#0b1220",
                        border:
                          "1px solid #164e63",
                        borderRadius:
                          "12px",
                        color: "#fff",
                      }}
                    />

                    <Legend
                      verticalAlign="bottom"
                      iconType="circle"
                    />

                  </PieChart>

                </ResponsiveContainer>

              </div>

            </div>

          </section>

          {/* ==================================================
              TOP PRODUCTS + PERFORMANCE
          ================================================== */}

          <section className="charts-grid">

            {/* TOP PRODUCTS */}

            <div className="glass-card chart-card">

              <div className="section-header">

                <div>

                  <h2>
                    Top Products
                  </h2>

                  <p>
                    Best performing products
                  </p>

                </div>

              </div>

              <div className="chart-wrapper">

                {productChartData.length >
                0 ? (

                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                  >

                    <BarChart
                      data={
                        productChartData
                      }
                    >

                      <CartesianGrid
                        stroke="#1e293b"
                        strokeDasharray="4 4"
                        vertical={false}
                      />

                      <XAxis
                        dataKey="name"
                        stroke="#64748b"
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(
                          value
                        ) =>
                          value.length >
                          12
                            ? `${value.slice(
                                0,
                                12
                              )}...`
                            : value
                        }
                      />

                      <YAxis
                        stroke="#64748b"
                        tickLine={false}
                        axisLine={false}
                      />

                      <Tooltip
                        contentStyle={{
                          background:
                            "#0b1220",
                          border:
                            "1px solid #164e63",
                          borderRadius:
                            "12px",
                          color: "#fff",
                        }}
                      />

                      <Bar
                        dataKey="sales"
                        fill="#5865f2"
                        radius={[
                          8,
                          8,
                          0,
                          0,
                        ]}
                      />

                    </BarChart>

                  </ResponsiveContainer>

                ) : (

                  <div className="empty-chart">

                    <Package size={40} />

                    <p>
                      Product sales data
                      will appear here
                    </p>

                  </div>

                )}

              </div>

            </div>

            {/* PERFORMANCE */}

            <div
              id="customers-section"
              className="glass-card summary-card"
            >

              <div className="section-header">

                <div>

                  <h2>
                    Performance
                  </h2>

                  <p>
                    Store performance summary
                  </p>

                </div>

              </div>

              <div className="performance-list">

                <PerformanceItem
                  icon={
                    <CircleDollarSign />
                  }
                  title="Revenue"
                  value={`₹${Number(
                    analytics.revenue ||
                      0
                  ).toLocaleString(
                    "en-IN"
                  )}`}
                />

                <PerformanceItem
                  icon={
                    <ShoppingCart />
                  }
                  title="Orders"
                  value={
                    analytics.totalOrders ||
                    0
                  }
                />

                <PerformanceItem
                  icon={
                    <Users />
                  }
                  title="Customers"
                  value={
                    analytics.customers ||
                    0
                  }
                />

                <PerformanceItem
                  icon={
                    <Package />
                  }
                  title="Products"
                  value={
                    analytics.products ||
                    0
                  }
                />

              </div>

            </div>

          </section>

          {/* ==================================================
              ORDERS
          ================================================== */}

          <section
            id="orders-section"
            className="glass-card orders-section"
          >

            <div className="section-header">

              <div>

                <h2>
                  Recent Orders
                </h2>

                <p>
                  Latest customer transactions
                </p>

              </div>

              <div className="count-badge">

                {orders.length} orders

              </div>

            </div>

            <div className="orders-list">

              {orders.length === 0 ? (

                <div className="empty-chart">

                  <ShoppingCart size={40} />

                  <p>
                    No orders yet
                  </p>

                </div>

              ) : (

                orders.map((order) => (

                  <div
                    className="order-item"
                    key={order._id}
                  >

                    <div className="order-icon">

                      <CreditCard size={18} />

                    </div>

                    <div className="order-info">

                      <strong>
                        {order.orderId}
                      </strong>

                      <span>
                        {order.customerName}
                      </span>

                    </div>

                    <div className="order-email">

                      {order.customerEmail}

                    </div>

                    <strong className="order-price">

                      ₹
                      {Number(
                        order.totalAmount ||
                          0
                      ).toLocaleString(
                        "en-IN"
                      )}

                    </strong>

                    <span
                      className={
                        `order-status ${
                          (
                            order.status ||
                            ""
                          ).toLowerCase()
                        }`
                      }
                    >
                      {order.status}
                    </span>

                  </div>

                ))

              )}

            </div>

          </section>

        </main>

      </div>
    </>
  );
}

// ============================================================
// STAT CARD
// ============================================================

function StatCard({
  title,
  value,
  growth,
  icon,
}) {
  return (
    <div className="stat-card">

      <div className="stat-card-top">

        <div className="stat-icon">
          {icon}
        </div>

        <div
          className={
            Number(growth ?? 0) < 0
              ? "growth negative"
              : "growth"
          }
        >

          <TrendingUp size={13} />

          {growth ?? 0}%

        </div>

      </div>

      <p>
        {title}
      </p>

      <h2>
        {value}
      </h2>

      <span>
        Compared with previous period
      </span>

    </div>
  );
}

// ============================================================
// PERFORMANCE ITEM
// ============================================================

function PerformanceItem({
  icon,
  title,
  value,
}) {
  return (
    <div className="performance-item">

      <div className="performance-icon">
        {icon}
      </div>

      <div>

        <span>
          {title}
        </span>

        <strong>
          {value}
        </strong>

      </div>

    </div>
  );
}

// ============================================================
// EVENT ICON
// ============================================================

function getEventIcon(type) {
  switch (type) {
    case "PRODUCT_SEARCHED":
      return <Search size={17} />;

    case "PRODUCT_VIEWED":
      return <Eye size={17} />;

    case "PRODUCT_ADDED_TO_CART":
      return <ShoppingCart size={17} />;

    case "CHECKOUT_STARTED":
      return <CreditCard size={17} />;

    case "ORDER_CREATED":
      return <Package size={17} />;

    case "PAYMENT_COMPLETED":
      return (
        <CircleDollarSign size={17} />
      );

    default:
      return <Activity size={17} />;
  }
}

// ============================================================
// EVENT FORMAT
// ============================================================

function formatEventType(type) {
  if (!type) {
    return "Activity";
  }

  return type
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(
      /\b\w/g,
      (char) =>
        char.toUpperCase()
    );
}

// ============================================================
// CSS
// ============================================================

const dashboardCSS = `

* {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  margin: 0;

  font-family:
    Inter,
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;

  background: #020617;
  color: #e2e8f0;
}

/* ============================================================
   PAGE
============================================================ */

.analytics-page {
  min-height: 100vh;

  display: flex;

  background:
    radial-gradient(
      circle at 80% 0%,
      rgba(0, 217, 255, 0.09),
      transparent 30%
    ),

    radial-gradient(
      circle at 20% 100%,
      rgba(88, 101, 242, 0.08),
      transparent 35%
    ),

    #020617;
}

/* ============================================================
   SIDEBAR
============================================================ */

.analytics-sidebar {
  width: 250px;

  position: fixed;

  top: 0;
  left: 0;
  bottom: 0;

  padding: 25px 16px;

  display: flex;
  flex-direction: column;

  background:
    rgba(2, 6, 23, 0.94);

  border-right:
    1px solid #172033;

  backdrop-filter:
    blur(20px);

  z-index: 100;
}

.brand {
  display: flex;

  align-items: center;

  gap: 12px;

  padding:
    0 8px 28px;
}

.brand-icon {
  width: 44px;
  height: 44px;

  display: flex;

  align-items: center;
  justify-content: center;

  border-radius: 13px;

  background:
    linear-gradient(
      135deg,
      #00d9ff,
      #5865f2
    );

  color: white;

  box-shadow:
    0 10px 30px
    rgba(0, 217, 255, 0.2);
}

.brand h2 {
  margin: 0;

  font-size: 19px;

  color: white;
}

.brand span {
  display: block;

  margin-top: 3px;

  font-size: 10px;

  color: #64748b;
}

.sidebar-label {
  padding:
    0 12px 10px;

  font-size: 10px;

  font-weight: 800;

  letter-spacing: 1.5px;

  color: #475569;
}

.sidebar-link {
  width: 100%;

  border: none;

  background: transparent;

  color: #94a3b8;

  display: flex;

  align-items: center;

  gap: 12px;

  padding:
    12px 13px;

  margin-bottom: 4px;

  border-radius: 10px;

  cursor: pointer;

  text-align: left;

  font-size: 14px;

  transition:
    0.2s ease;
}

.sidebar-link:hover {
  color: white;

  background:
    rgba(255,255,255,0.05);
}

.sidebar-link.active {
  color: #00d9ff;

  background:
    rgba(0,217,255,0.09);

  box-shadow:
    inset 3px 0 0 #00d9ff;
}

.sidebar-bottom {
  margin-top: auto;
}

.sidebar-system {
  display: flex;

  align-items: center;

  gap: 10px;

  padding:
    12px;

  margin-bottom: 10px;

  border:
    1px solid #172033;

  border-radius: 12px;

  background:
    rgba(15,23,42,0.6);
}

.sidebar-system strong {
  display: block;

  font-size: 12px;
}

.sidebar-system small {
  color: #64748b;

  font-size: 10px;
}

.system-dot {
  width: 8px;
  height: 8px;

  border-radius: 50%;

  background: #ef4444;
}

.system-dot.online {
  background: #22c55e;

  box-shadow:
    0 0 12px
    rgba(34,197,94,0.8);
}

.sidebar-link.logout:hover {
  color: #fb7185;

  background:
    rgba(244,63,94,0.08);
}

/* ============================================================
   MAIN
============================================================ */

.analytics-main {
  margin-left: 250px;

  width:
    calc(100% - 250px);

  padding:
    32px 38px 60px;

  max-width: 1800px;
}

/* ============================================================
   HEADER
============================================================ */

.analytics-header {
  display: flex;

  justify-content: space-between;

  align-items: flex-start;

  gap: 20px;

  margin-bottom: 24px;
}

.page-badge {
  display: inline-flex;

  align-items: center;

  gap: 7px;

  padding:
    6px 10px;

  border-radius: 20px;

  color: #67e8f9;

  background:
    rgba(0,217,255,0.08);

  border:
    1px solid
    rgba(0,217,255,0.18);

  font-size: 10px;

  font-weight: 800;

  letter-spacing: 1px;
}

.analytics-header h1 {
  margin:
    12px 0 5px;

  font-size: 31px;

  letter-spacing: -1px;

  color: white;
}

.analytics-header p {
  margin: 0;

  color: #64748b;

  font-size: 14px;
}

.header-actions {
  display: flex;

  align-items: center;

  gap: 15px;
}

.notification-btn {
  position: relative;

  width: 42px;
  height: 42px;

  border-radius: 11px;

  border:
    1px solid #1e293b;

  background:
    #0b1220;

  color: #94a3b8;

  display: flex;

  align-items: center;
  justify-content: center;

  cursor: pointer;

  transition: 0.2s ease;
}

.notification-btn:hover {
  color: white;

  border-color: #164e63;

  transform: translateY(-2px);
}

.notification-dot {
  width: 7px;
  height: 7px;

  position: absolute;

  top: 8px;
  right: 8px;

  border-radius: 50%;

  background: #ff3b81;
}

.profile-box {
  display: flex;

  align-items: center;

  gap: 10px;

  padding:
    6px 12px 6px 6px;

  border:
    1px solid #1e293b;

  border-radius: 13px;

  background:
    #0b1220;
}

.avatar {
  width: 37px;
  height: 37px;

  display: flex;

  align-items: center;
  justify-content: center;

  border-radius: 10px;

  background:
    linear-gradient(
      135deg,
      #00d9ff,
      #5865f2
    );

  color: white;

  font-weight: 800;
}

.profile-box strong {
  display: block;

  font-size: 12px;

  color: white;
}

.profile-box small {
  display: block;

  margin-top: 2px;

  font-size: 10px;

  color: #64748b;
}

/* ============================================================
   LIVE BAR
============================================================ */

.live-bar {
  display: flex;

  align-items: center;

  justify-content: space-between;

  padding:
    12px 16px;

  margin-bottom: 22px;

  border:
    1px solid #172033;

  border-radius: 12px;

  background:
    rgba(11,18,32,0.75);
}

.live-left {
  display: flex;

  align-items: center;

  gap: 9px;

  font-size: 12px;

  color: #64748b;
}

.live-left strong {
  font-size: 11px;

  letter-spacing: 1px;
}

.live-status {
  color: #22c55e;
}

.offline-status {
  color: #ef4444;
}

.live-dot,
.offline-dot {
  width: 8px;
  height: 8px;

  border-radius: 50%;
}

.live-dot {
  background: #22c55e;

  box-shadow:
    0 0 14px
    rgba(34,197,94,0.9);

  animation:
    pulse 1.5s infinite;
}

.offline-dot {
  background: #ef4444;
}

.last-update {
  color: #475569;

  font-size: 11px;
}

@keyframes pulse {

  0% {
    box-shadow:
      0 0 0 0
      rgba(34,197,94,0.6);
  }

  70% {
    box-shadow:
      0 0 0 7px
      rgba(34,197,94,0);
  }

  100% {
    box-shadow:
      0 0 0 0
      rgba(34,197,94,0);
  }

}

/* ============================================================
   STAT CARDS
============================================================ */

.stats-grid {
  display: grid;

  grid-template-columns:
    repeat(4, 1fr);

  gap: 17px;

  margin-bottom: 20px;
}

.stat-card {
  padding: 20px;

  border:
    1px solid #172033;

  border-radius: 16px;

  background:
    linear-gradient(
      145deg,
      rgba(15,23,42,0.95),
      rgba(7,12,25,0.95)
    );

  transition:
    0.25s ease;
}

.stat-card:hover {
  transform:
    translateY(-3px);

  border-color:
    #164e63;

  box-shadow:
    0 15px 40px
    rgba(0,0,0,0.25);
}

.stat-card-top {
  display: flex;

  align-items: center;

  justify-content: space-between;
}

.stat-icon {
  width: 42px;
  height: 42px;

  display: flex;

  align-items: center;
  justify-content: center;

  border-radius: 11px;

  color: #67e8f9;

  background:
    rgba(0,217,255,0.08);
}

.growth {
  display: flex;

  align-items: center;

  gap: 3px;

  color: #22c55e;

  font-size: 11px;

  font-weight: 700;
}

.growth.negative {
  color: #fb7185;
}

.stat-card p {
  margin:
    18px 0 5px;

  color: #64748b;

  font-size: 12px;
}

.stat-card h2 {
  margin: 0;

  font-size: 26px;

  color: white;
}

.stat-card > span {
  display: block;

  margin-top: 7px;

  color: #475569;

  font-size: 10px;
}

/* ============================================================
   CARDS
============================================================ */

.glass-card {
  border:
    1px solid #172033;

  border-radius: 17px;

  background:
    rgba(11,18,32,0.82);

  box-shadow:
    0 15px 45px
    rgba(0,0,0,0.12);

  overflow: hidden;
}

.section-header {
  display: flex;

  justify-content: space-between;

  align-items: center;

  gap: 15px;

  padding:
    20px 22px;

  border-bottom:
    1px solid #172033;
}

.section-header h2 {
  margin: 0;

  color: white;

  font-size: 16px;
}

.section-header p {
  margin:
    5px 0 0;

  color: #64748b;

  font-size: 11px;
}

/* ============================================================
   LIVE ACTIVITY
============================================================ */

.activity-card {
  margin-bottom: 20px;
}

.live-pill {
  display: flex;

  align-items: center;

  gap: 6px;

  padding:
    6px 10px;

  border-radius: 20px;

  background:
    rgba(34,197,94,0.08);

  border:
    1px solid
    rgba(34,197,94,0.15);

  color: #4ade80;

  font-size: 10px;

  font-weight: 800;
}

.live-pill span {
  width: 6px;
  height: 6px;

  border-radius: 50%;

  background: #22c55e;
}

.live-pill span.pulse {
  animation:
    pulse 1.5s infinite;
}

.activity-list {
  max-height: 410px;

  overflow-y: auto;
}

.activity-row {
  display: flex;

  align-items: center;

  gap: 13px;

  padding:
    14px 22px;

  border-bottom:
    1px solid
    rgba(30,41,59,0.6);

  transition:
    0.2s ease;
}

.activity-row:hover {
  background:
    rgba(255,255,255,0.025);
}

.activity-icon {
  width: 36px;
  height: 36px;

  min-width: 36px;

  display: flex;

  align-items: center;
  justify-content: center;

  border-radius: 10px;

  color: #67e8f9;

  background:
    rgba(0,217,255,0.08);
}

.activity-content {
  flex: 1;

  min-width: 0;
}

.activity-content strong {
  display: block;

  color: #e2e8f0;

  font-size: 12px;
}

.activity-content span {
  display: block;

  margin-top: 3px;

  color: #64748b;

  font-size: 11px;

  overflow: hidden;

  text-overflow: ellipsis;

  white-space: nowrap;
}

.activity-right {
  text-align: right;
}

.activity-right strong {
  display: block;

  color: #67e8f9;

  font-size: 11px;
}

.activity-right small {
  display: block;

  margin-top: 3px;

  color: #475569;

  font-size: 9px;
}

.empty-activity {
  min-height: 180px;

  display: flex;

  flex-direction: column;

  align-items: center;

  justify-content: center;

  color: #475569;

  text-align: center;

  padding: 30px;
}

.empty-activity h3 {
  margin:
    12px 0 5px;

  color: #94a3b8;

  font-size: 14px;
}

.empty-activity p {
  margin: 0;

  font-size: 11px;
}

/* ============================================================
   CHARTS
============================================================ */

.charts-grid {
  display: grid;

  grid-template-columns:
    1.55fr 1fr;

  gap: 20px;

  margin-bottom: 20px;
}

.chart-card {
  min-height: 390px;
}

.chart-tag {
  display: flex;

  align-items: center;

  gap: 5px;

  padding:
    6px 10px;

  border-radius: 8px;

  background:
    rgba(0,217,255,0.07);

  color: #67e8f9;

  font-size: 10px;
}

.chart-wrapper {
  height: 310px;

  padding:
    18px 15px 12px;
}

.pie-wrapper {
  height: 310px;

  padding: 10px;
}

.empty-chart {
  height: 100%;

  display: flex;

  flex-direction: column;

  align-items: center;

  justify-content: center;

  color: #475569;
}

.empty-chart p {
  margin-top: 12px;

  font-size: 12px;
}

/* ============================================================
   PERFORMANCE
============================================================ */

.summary-card {
  min-height: 390px;
}

.performance-list {
  padding:
    10px 22px;
}

.performance-item {
  display: flex;

  align-items: center;

  gap: 13px;

  padding:
    16px 0;

  border-bottom:
    1px solid
    #172033;
}

.performance-item:last-child {
  border-bottom: none;
}

.performance-icon {
  width: 40px;
  height: 40px;

  display: flex;

  align-items: center;
  justify-content: center;

  border-radius: 10px;

  color: #67e8f9;

  background:
    rgba(0,217,255,0.08);
}

.performance-item span {
  display: block;

  color: #64748b;

  font-size: 11px;
}

.performance-item strong {
  display: block;

  margin-top: 3px;

  color: white;

  font-size: 16px;
}

/* ============================================================
   ORDERS
============================================================ */

.orders-section {
  margin-bottom: 20px;
}

.orders-list {
  padding: 0;
}

.order-item {
  display: grid;

  grid-template-columns:
    42px
    1fr
    1.2fr
    120px
    100px;

  align-items: center;

  gap: 15px;

  padding:
    15px 22px;

  border-bottom:
    1px solid
    rgba(30,41,59,0.6);
}

.order-item:hover {
  background:
    rgba(255,255,255,0.02);
}

.order-icon {
  width: 36px;
  height: 36px;

  display: flex;

  align-items: center;
  justify-content: center;

  border-radius: 9px;

  color: #a78bfa;

  background:
    rgba(139,92,246,0.1);
}

.order-info strong {
  display: block;

  color: white;

  font-size: 12px;
}

.order-info span {
  display: block;

  margin-top: 3px;

  color: #64748b;

  font-size: 10px;
}

.order-email {
  color: #475569;

  font-size: 10px;

  overflow: hidden;

  text-overflow: ellipsis;
}

.order-price {
  color: #67e8f9;

  font-size: 12px;
}

.order-status {
  padding:
    6px 9px;

  border-radius: 7px;

  text-align: center;

  font-size: 9px;

  font-weight: 700;

  background:
    #111827;

  color: #94a3b8;
}

.order-status.delivered {
  color: #4ade80;

  background:
    rgba(34,197,94,0.08);
}

.order-status.pending {
  color: #fbbf24;

  background:
    rgba(251,191,36,0.08);
}

.order-status.processing {
  color: #38bdf8;

  background:
    rgba(56,189,248,0.08);
}

.order-status.cancelled {
  color: #fb7185;

  background:
    rgba(244,63,94,0.08);
}

.count-badge {
  padding:
    6px 10px;

  border-radius: 8px;

  color: #94a3b8;

  background:
    #111827;

  border:
    1px solid #1e293b;

  font-size: 10px;
}

/* ============================================================
   LOADING
============================================================ */

.analytics-loading {
  min-height: 100vh;

  display: flex;

  flex-direction: column;

  align-items: center;

  justify-content: center;

  background:
    #020617;

  color: #94a3b8;

  text-align: center;
}

.analytics-loading h2 {
  margin:
    20px 0 6px;

  color: white;
}

.analytics-loading p {
  margin: 0;

  color: #64748b;

  font-size: 13px;
}

.loading-ring {
  width: 55px;
  height: 55px;

  border:
    3px solid
    #172033;

  border-top-color:
    #00d9ff;

  border-radius: 50%;

  animation:
    spin 0.8s linear infinite;
}

@keyframes spin {

  to {
    transform:
      rotate(360deg);
  }

}

.retry-btn {
  margin-top: 18px;

  padding:
    10px 18px;

  border: none;

  border-radius: 9px;

  background:
    linear-gradient(
      135deg,
      #00d9ff,
      #5865f2
    );

  color: white;

  font-weight: 700;

  cursor: pointer;
}

/* ============================================================
   RESPONSIVE
============================================================ */

@media (max-width: 1200px) {

  .stats-grid {
    grid-template-columns:
      repeat(2, 1fr);
  }

}

@media (max-width: 900px) {

  .analytics-sidebar {
    width: 75px;

    padding:
      20px 10px;
  }

  .brand {
    justify-content: center;
  }

  .brand > div:last-child,
  .sidebar-label,
  .sidebar-link span,
  .sidebar-system {
    display: none;
  }

  .sidebar-link {
    justify-content: center;
  }

  .analytics-main {
    margin-left: 75px;

    width:
      calc(100% - 75px);

    padding:
      25px 20px;
  }

  .charts-grid {
    grid-template-columns:
      1fr;
  }

  .order-item {
    grid-template-columns:
      42px
      1fr
      100px;
  }

  .order-email {
    display: none;
  }

}

@media (max-width: 650px) {

  .analytics-main {
    padding:
      20px 12px;
  }

  .analytics-header {
    flex-direction: column;
  }

  .header-actions {
    width: 100%;

    justify-content:
      space-between;
  }

  .live-bar {
    flex-direction: column;

    align-items:
      flex-start;

    gap: 8px;
  }

  .stats-grid {
    grid-template-columns:
      1fr;
  }

  .analytics-header h1 {
    font-size: 25px;
  }

  .order-item {
    grid-template-columns:
      36px
      1fr
      85px;

    padding:
      14px 12px;
  }

  .order-price {
    display: none;
  }

  .chart-wrapper {
    height: 280px;
  }

  .section-header {
    padding:
      17px 15px;
  }

  .activity-row {
    padding:
      13px 15px;
  }

}
`;

// ============================================================
// EXPORT
// ============================================================

export default Analytics;
