import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";

import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Search,
  Bell,
  ChevronDown,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Eye,
  MoreVertical,
  ArrowUpRight,
  Activity,
  CircleDollarSign,
  Boxes,
  Menu,
  X,
} from "lucide-react";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import "./Dashboard.css";

const BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL || BASE_URL;


/* =========================================================
   DEMO DATA
   This is only fallback data.
   Your MongoDB data will replace it when API is available.
========================================================= */

const fallbackSales = [
  { name: "Mon", sales: 18000 },
  { name: "Tue", sales: 24000 },
  { name: "Wed", sales: 21000 },
  { name: "Thu", sales: 32000 },
  { name: "Fri", sales: 28000 },
  { name: "Sat", sales: 42000 },
  { name: "Sun", sales: 39000 },
];

const fallbackOrders = [
  {
    id: "#ORD-10482",
    customer: "Aarav Sharma",
    product: "Wireless Headphones",
    amount: 4999,
    status: "Delivered",
    date: "Today, 09:42",
  },
  {
    id: "#ORD-10481",
    customer: "Simran Kaur",
    product: "Smart Watch",
    amount: 7299,
    status: "Processing",
    date: "Today, 09:21",
  },
  {
    id: "#ORD-10480",
    customer: "Rohan Mehta",
    product: "Running Shoes",
    amount: 3499,
    status: "Delivered",
    date: "Today, 08:56",
  },
  {
    id: "#ORD-10479",
    customer: "Ananya Singh",
    product: "Laptop Backpack",
    amount: 1899,
    status: "Pending",
    date: "Today, 08:32",
  },
  {
    id: "#ORD-10478",
    customer: "Kabir Verma",
    product: "Bluetooth Speaker",
    amount: 2599,
    status: "Cancelled",
    date: "Yesterday",
  },
];

const fallbackProducts = [
  {
    name: "Wireless Headphones",
    category: "Electronics",
    sales: 428,
    revenue: 213572,
  },
  {
    name: "Smart Watch",
    category: "Electronics",
    sales: 362,
    revenue: 264238,
  },
  {
    name: "Running Shoes",
    category: "Footwear",
    sales: 291,
    revenue: 101409,
  },
  {
    name: "Laptop Backpack",
    category: "Accessories",
    sales: 245,
    revenue: 46555,
  },
];


/* =========================================================
   MAIN DASHBOARD
========================================================= */

function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [analytics, setAnalytics] = useState({
    totalOrders: 1248,
    revenue: 248590,
    customers: 8421,
    products: 356,
    conversionRate: 4.8,
    revenueGrowth: 12.6,
    orderGrowth: 8.4,
    customerGrowth: 14.2,
  });

  const [salesData, setSalesData] = useState(fallbackSales);
  const [orders, setOrders] = useState(fallbackOrders);
  const [products, setProducts] = useState(fallbackProducts);

  const [activeMenu, setActiveMenu] = useState("Dashboard");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [user, setUser] = useState({
    name: "Admin",
    email: "",
  });


  /* =======================================================
     FETCH CURRENT USER
  ======================================================= */

  useEffect(() => {
    const getUser = async () => {
      try {
        const response = await axios.get(
          `${BASE_URL}/profile/view`,
          {
            withCredentials: true,
          }
        );

        if (response.data) {
          setUser({
            name:
              response.data.firstName ||
              response.data.name ||
              "Admin",

            email: response.data.email || "",
          });
        }
      } catch (error) {
        console.log("User fetch skipped");
      }
    };

    getUser();
  }, []);


  /* =======================================================
     FETCH DASHBOARD DATA
  ======================================================= */

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await axios.get(
          `${BASE_URL}/analytics/dashboard`,
          {
            withCredentials: true,
          }
        );

        if (response.data) {
          if (response.data.analytics) {
            setAnalytics((prev) => ({
              ...prev,
              ...response.data.analytics,
            }));
          }

          if (response.data.sales) {
            setSalesData(response.data.sales);
          }

          if (response.data.orders) {
            setOrders(response.data.orders);
          }

          if (response.data.products) {
            setProducts(response.data.products);
          }
        }
      } catch (error) {
        console.log(
          "Using dashboard fallback data:",
          error.message
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);


  /* =======================================================
     SOCKET.IO REAL-TIME CONNECTION
  ======================================================= */

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      withCredentials: true,
    });

    socket.on("connect", () => {
      console.log(
        "Dashboard connected:",
        socket.id
      );
    });

    socket.on(
      "analyticsUpdated",
      (data) => {
        console.log(
          "Real-time analytics update:",
          data
        );

        if (data?.analytics) {
          setAnalytics((prev) => ({
            ...prev,
            ...data.analytics,
          }));
        }

        /*
          If backend sends an event,
          update the order/activity UI.
        */

        if (data?.event) {
          const event = data.event;

          if (
            event.type === "ORDER_CREATED" ||
            event.type === "order_created"
          ) {
            setAnalytics((prev) => ({
              ...prev,
              totalOrders:
                Number(prev.totalOrders || 0) + 1,
            }));
          }
        }
      }
    );

    socket.on("disconnect", () => {
      console.log("Dashboard disconnected");
    });

    return () => {
      socket.disconnect();
    };
  }, []);


  /* =======================================================
     LOGOUT
  ======================================================= */

  const handleLogout = async () => {
    try {
      await axios.post(
        `${BASE_URL}/logout`,
        {},
        {
          withCredentials: true,
        }
      );

      window.location.href = "/";
    } catch (error) {
      console.error(
        "Logout failed:",
        error
      );
    }
  };


  /* =======================================================
     SEARCH
  ======================================================= */

  const filteredOrders = useMemo(() => {
    if (!search.trim()) {
      return orders;
    }

    const value = search.toLowerCase();

    return orders.filter(
      (order) =>
        order.id?.toLowerCase().includes(value) ||
        order.customer
          ?.toLowerCase()
          .includes(value) ||
        order.product
          ?.toLowerCase()
          .includes(value)
    );
  }, [orders, search]);


  /* =======================================================
     FORMAT CURRENCY
  ======================================================= */

  const formatCurrency = (value) => {
    return new Intl.NumberFormat(
      "en-IN",
      {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }
    ).format(value || 0);
  };


  return (
    <div className="dashboard-shell">

      {/* =====================================================
          MOBILE OVERLAY
      ===================================================== */}

      {sidebarOpen && (
        <div
          className="mobile-overlay"
          onClick={() =>
            setSidebarOpen(false)
          }
        />
      )}


      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside
        className={`dashboard-sidebar ${
          sidebarOpen
            ? "sidebar-open"
            : ""
        }`}
      >

        <div className="sidebar-brand">

          <div className="brand-icon">
            <ShoppingCart size={19} />
          </div>

          <div>
            <h2>Shoplytics</h2>
            <span>Analytics</span>
          </div>

          <button
            className="close-sidebar"
            onClick={() =>
              setSidebarOpen(false)
            }
          >
            <X size={20} />
          </button>

        </div>


        <div className="sidebar-section-title">
          MAIN MENU
        </div>


        <nav className="sidebar-nav">

          <SidebarItem
            icon={<LayoutDashboard size={18} />}
            text="Dashboard"
            active={activeMenu === "Dashboard"}
            onClick={() =>
              setActiveMenu("Dashboard")
            }
          />

          <SidebarItem
            icon={<ShoppingCart size={18} />}
            text="Orders"
            active={activeMenu === "Orders"}
            onClick={() =>
              setActiveMenu("Orders")
            }
          />

          <SidebarItem
            icon={<Package size={18} />}
            text="Products"
            active={activeMenu === "Products"}
            onClick={() =>
              setActiveMenu("Products")
            }
          />

          <SidebarItem
            icon={<Users size={18} />}
            text="Customers"
            active={activeMenu === "Customers"}
            onClick={() =>
              setActiveMenu("Customers")
            }
          />

          <SidebarItem
            icon={<BarChart3 size={18} />}
            text="Analytics"
            active={activeMenu === "Analytics"}
            onClick={() =>
              setActiveMenu("Analytics")
            }
          />

        </nav>


        <div className="sidebar-section-title settings-title">
          SYSTEM
        </div>


        <nav className="sidebar-nav">

          <SidebarItem
            icon={<Settings size={18} />}
            text="Settings"
            active={activeMenu === "Settings"}
            onClick={() =>
              setActiveMenu("Settings")
            }
          />

        </nav>


        <div className="sidebar-bottom">

          <div className="live-status">
            <span className="live-dot" />
            <div>
              <strong>Live tracking</strong>
              <small>Real-time enabled</small>
            </div>
          </div>


          <button
            className="logout-button"
            onClick={handleLogout}
          >
            <LogOut size={17} />
            Logout
          </button>

        </div>

      </aside>


      {/* =====================================================
          MAIN AREA
      ===================================================== */}

      <main className="dashboard-main">

        {/* ===================================================
            TOPBAR
        =================================================== */}

        <header className="dashboard-header">

          <button
            className="mobile-menu-button"
            onClick={() =>
              setSidebarOpen(true)
            }
          >
            <Menu size={22} />
          </button>


          <div className="header-title">

            <h1>Dashboard</h1>

            <p>
              Monitor your store performance
              in real-time.
            </p>

          </div>


          <div className="header-actions">

            <div className="search-box">

              <Search size={17} />

              <input
                type="text"
                placeholder="Search orders..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
              />

              <span className="search-shortcut">
                /
              </span>

            </div>


            <button className="icon-button">
              <Bell size={18} />
              <span className="notification-dot" />
            </button>


            <div className="user-profile">

              <div className="avatar">
                {user.name
                  ?.charAt(0)
                  ?.toUpperCase() || "A"}
              </div>

              <div className="user-info">

                <strong>
                  {user.name}
                </strong>

                <span>Administrator</span>

              </div>

              <ChevronDown size={15} />

            </div>

          </div>

        </header>


        <div className="dashboard-content">

          {/* =================================================
              LIVE BADGE
          ================================================= */}

          <div className="dashboard-intro">

            <div>
              <h2>
                Overview
              </h2>

              <p>
                Here's what's happening
                with your store today.
              </p>
            </div>

            <div className="live-badge">
              <span />
              Live
            </div>

          </div>


          {/* =================================================
              STAT CARDS
          ================================================= */}

          <section className="stats-grid">

            <StatCard
              title="Total Orders"
              value={analytics.totalOrders}
              change={analytics.orderGrowth}
              icon={<ShoppingCart />}
              positive
            />

            <StatCard
              title="Revenue"
              value={formatCurrency(
                analytics.revenue
              )}
              change={analytics.revenueGrowth}
              icon={<CircleDollarSign />}
              positive
            />

            <StatCard
              title="Customers"
              value={Number(
                analytics.customers || 0
              ).toLocaleString("en-IN")}
              change={analytics.customerGrowth}
              icon={<Users />}
              positive
            />

            <StatCard
              title="Products"
              value={analytics.products}
              change={analytics.productGrowth || 5.2}
              icon={<Boxes />}
              positive
            />

          </section>


          {/* =================================================
              CHART + ORDER STATUS
          ================================================= */}

          <section className="main-grid">

            {/* SALES CHART */}

            <div className="dashboard-card sales-card">

              <div className="card-header">

                <div>

                  <h3>
                    Sales Overview
                  </h3>

                  <p>
                    Revenue generated this week
                  </p>

                </div>

                <select className="period-select">
                  <option>
                    This Week
                  </option>
                  <option>
                    This Month
                  </option>
                  <option>
                    This Year
                  </option>
                </select>

              </div>


              <div className="chart-container">

                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >

                  <AreaChart
                    data={salesData}
                  >

                    <defs>

                      <linearGradient
                        id="salesGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >

                        <stop
                          offset="0%"
                          stopOpacity={0.3}
                        />

                        <stop
                          offset="100%"
                          stopOpacity={0}
                        />

                      </linearGradient>

                    </defs>


                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="rgba(255,255,255,0.06)"
                    />

                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fill: "#73798c",
                        fontSize: 11,
                      }}
                    />

                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fill: "#73798c",
                        fontSize: 11,
                      }}
                      tickFormatter={(value) =>
                        `₹${value / 1000}k`
                      }
                    />

                    <Tooltip
                      contentStyle={{
                        background:
                          "#171b26",
                        border:
                          "1px solid #292f3d",
                        borderRadius: "10px",
                        color: "#fff",
                      }}
                      formatter={(value) =>
                        formatCurrency(value)
                      }
                    />

                    <Area
                      type="monotone"
                      dataKey="sales"
                      stroke="#6c63ff"
                      strokeWidth={3}
                      fill="url(#salesGradient)"
                    />

                  </AreaChart>

                </ResponsiveContainer>

              </div>

            </div>


            {/* ORDER STATUS */}

            <div className="dashboard-card status-card">

              <div className="card-header">

                <div>

                  <h3>
                    Order Status
                  </h3>

                  <p>
                    Today's order distribution
                  </p>

                </div>

                <MoreVertical
                  size={18}
                  className="muted-icon"
                />

              </div>


              <div className="status-chart">

                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >

                  <PieChart>

                    <Pie
                      data={[
                        {
                          name: "Delivered",
                          value: 62,
                        },
                        {
                          name: "Processing",
                          value: 23,
                        },
                        {
                          name: "Pending",
                          value: 10,
                        },
                        {
                          name: "Cancelled",
                          value: 5,
                        },
                      ]}
                      innerRadius={58}
                      outerRadius={78}
                      paddingAngle={4}
                      dataKey="value"
                    >

                      <Cell fill="#6c63ff" />
                      <Cell fill="#20c997" />
                      <Cell fill="#f5b942" />
                      <Cell fill="#ef5b7a" />

                    </Pie>

                  </PieChart>

                </ResponsiveContainer>


                <div className="donut-center">

                  <strong>
                    {analytics.totalOrders}
                  </strong>

                  <span>Orders</span>

                </div>

              </div>


              <div className="status-list">

                <StatusItem
                  label="Delivered"
                  value="62%"
                  className="delivered"
                />

                <StatusItem
                  label="Processing"
                  value="23%"
                  className="processing"
                />

                <StatusItem
                  label="Pending"
                  value="10%"
                  className="pending"
                />

                <StatusItem
                  label="Cancelled"
                  value="5%"
                  className="cancelled"
                />

              </div>

            </div>

          </section>


          {/* =================================================
              RECENT ORDERS + TOP PRODUCTS
          ================================================= */}

          <section className="bottom-grid">

            {/* RECENT ORDERS */}

            <div className="dashboard-card orders-card">

              <div className="card-header">

                <div>

                  <h3>
                    Recent Orders
                  </h3>

                  <p>
                    Latest transactions from your store
                  </p>

                </div>

                <button className="view-all">
                  View All
                  <ArrowUpRight size={14} />
                </button>

              </div>


              <div className="table-wrapper">

                <table>

                  <thead>

                    <tr>

                      <th>Order</th>
                      <th>Customer</th>
                      <th>Product</th>
                      <th>Amount</th>
                      <th>Status</th>

                    </tr>

                  </thead>


                  <tbody>

                    {filteredOrders
                      .slice(0, 5)
                      .map((order) => (

                        <tr key={order.id}>

                          <td>
                            <strong>
                              {order.id}
                            </strong>
                          </td>

                          <td>
                            {order.customer}
                          </td>

                          <td>
                            {order.product}
                          </td>

                          <td>
                            <strong>
                              {formatCurrency(
                                order.amount
                              )}
                            </strong>
                          </td>

                          <td>
                            <span
                              className={`status-pill ${getStatusClass(
                                order.status
                              )}`}
                            >
                              {order.status}
                            </span>
                          </td>

                        </tr>

                      ))}

                  </tbody>

                </table>

              </div>

            </div>


            {/* TOP PRODUCTS */}

            <div className="dashboard-card products-card">

              <div className="card-header">

                <div>

                  <h3>
                    Top Products
                  </h3>

                  <p>
                    Best performing products
                  </p>

                </div>

                <button className="view-all">
                  View All
                  <ArrowUpRight size={14} />
                </button>

              </div>


              <div className="product-list">

                {products
                  .slice(0, 4)
                  .map((product, index) => (

                    <div
                      className="product-row"
                      key={index}
                    >

                      <div className="product-image">

                        <Package size={18} />

                      </div>


                      <div className="product-details">

                        <strong>
                          {product.name}
                        </strong>

                        <span>
                          {product.category}
                        </span>

                      </div>


                      <div className="product-sales">

                        <strong>
                          {product.sales}
                        </strong>

                        <span>
                          sales
                        </span>

                      </div>

                    </div>

                  ))}

              </div>

            </div>

          </section>


          {/* =================================================
              REAL TIME ACTIVITY
          ================================================= */}

          <section className="dashboard-card activity-card">

            <div className="card-header">

              <div>

                <h3>
                  Real-Time Activity
                </h3>

                <p>
                  Live events coming from your store
                </p>

              </div>

              <div className="activity-live">
                <Activity size={15} />
                Streaming
              </div>

            </div>


            <div className="activity-grid">

              <ActivityItem
                icon={<ShoppingCart />}
                title="New order received"
                description="Order #ORD-10482"
                time="Just now"
              />

              <ActivityItem
                icon={<Eye />}
                title="Product viewed"
                description="Wireless Headphones"
                time="12 sec ago"
              />

              <ActivityItem
                icon={<DollarSign />}
                title="Payment completed"
                description="₹4,999 received"
                time="34 sec ago"
              />

              <ActivityItem
                icon={<Users />}
                title="New customer"
                description="Aarav Sharma"
                time="1 min ago"
              />

            </div>

          </section>

        </div>

      </main>

    </div>
  );
}


/* =========================================================
   SIDEBAR ITEM
========================================================= */

function SidebarItem({
  icon,
  text,
  active,
  onClick,
}) {
  return (
    <button
      className={`sidebar-item ${
        active ? "active" : ""
      }`}
      onClick={onClick}
    >
      {icon}
      <span>{text}</span>
    </button>
  );
}


/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  title,
  value,
  change,
  icon,
  positive,
}) {
  return (
    <div className="stat-card">

      <div className="stat-top">

        <div className="stat-icon">
          {icon}
        </div>

        <span className="stat-label">
          {title}
        </span>

      </div>


      <div className="stat-value">
        {value}
      </div>


      <div className="stat-footer">

        <span
          className={`stat-change ${
            positive
              ? "positive"
              : "negative"
          }`}
        >

          {positive ? (
            <TrendingUp size={13} />
          ) : (
            <TrendingDown size={13} />
          )}

          {change}%

        </span>

        <span>
          vs last period
        </span>

      </div>

    </div>
  );
}


/* =========================================================
   STATUS ITEM
========================================================= */

function StatusItem({
  label,
  value,
  className,
}) {
  return (
    <div className="status-item">

      <div>

        <span
          className={`status-dot ${className}`}
        />

        {label}

      </div>

      <strong>
        {value}
      </strong>

    </div>
  );
}


/* =========================================================
   ACTIVITY ITEM
========================================================= */

function ActivityItem({
  icon,
  title,
  description,
  time,
}) {
  return (
    <div className="activity-item">

      <div className="activity-icon">
        {icon}
      </div>

      <div className="activity-content">

        <strong>
          {title}
        </strong>

        <span>
          {description}
        </span>

      </div>

      <time>
        {time}
      </time>

    </div>
  );
}


/* =========================================================
   STATUS CLASS
========================================================= */

function getStatusClass(status) {
  switch (
    status?.toLowerCase()
  ) {
    case "delivered":
      return "delivered";

    case "processing":
      return "processing";

    case "pending":
      return "pending";

    case "cancelled":
      return "cancelled";

    default:
      return "processing";
  }
}


export default Dashboard;