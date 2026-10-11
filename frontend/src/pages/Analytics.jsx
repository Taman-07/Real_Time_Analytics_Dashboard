import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate, Link } from "react-router-dom";
import { io } from "socket.io-client";
import {
  Activity,
  BarChart3,
  Bell,
  CircleDollarSign,
  CreditCard,
  Eye,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Pause,
  Play,
  RefreshCw,
  RotateCcw,
  Search,
  ShoppingCart,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Users,
  User,
  X,
  Zap,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import API from "../services/api";

/* ============================================================
   CONFIG
============================================================ */

const SOCKET_URL = "http://localhost:5000";

const STATUS_META = [
  { key: "delivered", label: "Delivered", color: "#10b981", bg: "rgba(16, 185, 129, 0.12)" },
  { key: "processing", label: "Processing", color: "#38bdf8", bg: "rgba(56, 189, 248, 0.12)" },
  { key: "pending", label: "Pending", color: "#f59e0b", bg: "rgba(245, 158, 11, 0.12)" },
  { key: "cancelled", label: "Cancelled", color: "#f43f5e", bg: "rgba(244, 63, 94, 0.12)" },
];

const NAV = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "sales-section", label: "Revenue Analytics", icon: BarChart3 },
  { id: "orders-section", label: "Recent Orders", icon: ShoppingCart },
  { id: "customers-section", label: "Performance & Status", icon: Users },
];

const inr = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

/* ============================================================
   ANIMATED HOOKS & HELPERS
============================================================ */

function useCountUp(target, duration = 900, resetKey = 0) {
  const [value, setValue] = useState(0);
  const previous = useRef(0);

  useEffect(() => {
    const reduce = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)"
    )?.matches;

    if (reduce) {
      setValue(target);
      previous.current = target;
      return undefined;
    }

    const from = resetKey ? 0 : previous.current;
    const start = performance.now();
    let raf;

    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(from + (target - from) * eased);
      if (p < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        previous.current = target;
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, resetKey]);

  return value;
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function formatTime(date) {
  if (!date) return "Waiting for data";
  return new Date(date).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function formatEventType(type) {
  if (!type) return "Live Activity";
  return type
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function eventMeta(type) {
  switch (type) {
    case "PRODUCT_SEARCHED":
      return { icon: <Search size={16} />, tone: "tone-violet", badge: "Discovery" };
    case "PRODUCT_VIEWED":
      return { icon: <Eye size={16} />, tone: "tone-sky", badge: "Browsing" };
    case "PRODUCT_ADDED_TO_CART":
      return { icon: <ShoppingCart size={16} />, tone: "tone-amber", badge: "Cart Action" };
    case "CHECKOUT_STARTED":
      return { icon: <CreditCard size={16} />, tone: "tone-amber", badge: "Checkout" };
    case "ORDER_CREATED":
      return { icon: <Package size={16} />, tone: "tone-mint", badge: "New Order" };
    case "PAYMENT_COMPLETED":
      return { icon: <CircleDollarSign size={16} />, tone: "tone-mint", badge: "Paid" };
    default:
      return { icon: <Activity size={16} />, tone: "tone-sky", badge: "Telemetry" };
  }
}

/* ============================================================
   TOOLTIP & SUB-COMPONENTS
============================================================ */

function ChartTooltip({ active, payload, label, money = false }) {
  if (!active || !payload?.length) return null;
  const v = payload[0].value;
  return (
    <div className="chart-tooltip-deluxe">
      <div className="tooltip-header">
        <span className="tooltip-dot" />
        <span className="tooltip-label">{label || payload[0].name}</span>
      </div>
      <div className="tooltip-val">
        {money ? inr(v) : Number(v).toLocaleString("en-IN")}
      </div>
    </div>
  );
}

function Growth({ value }) {
  const n = Number(value ?? 0);
  const down = n < 0;
  return (
    <span className={`growth-chip ${down ? "down" : "up"}`}>
      {down ? <TrendingDown size={13} /> : <TrendingUp size={13} />}
      <span>{down ? "" : "+"}{n}%</span>
    </span>
  );
}

function KpiCard({ title, value, growth, icon, tone, subtitle = "vs previous period", resetKey = 0 }) {
  const animated = useCountUp(Number(value) || 0, 900, resetKey);
  return (
    <div className={`kpi-card-deluxe ${tone}`}>
      <div className="kpi-top">
        <div className="kpi-icon-wrapper">
          {icon}
        </div>
        <Growth value={growth} />
      </div>

      <div className="kpi-body">
        <span className="kpi-title">{title}</span>
        <h3 className="kpi-value">{Math.round(animated).toLocaleString("en-IN")}</h3>
      </div>

      <div className="kpi-bottom">
        <span className="kpi-sub-text">{subtitle}</span>
        <div className="kpi-spark-bar">
          <div className="kpi-spark-fill" />
        </div>
      </div>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="an-page">
      <div className="sk-shell">
        <div className="sk sk-title" />
        <div className="sk sk-hero" />
        <div className="sk-row">
          <div className="sk sk-kpi" />
          <div className="sk sk-kpi" />
          <div className="sk sk-kpi" />
          <div className="sk sk-kpi" />
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   MAIN COMPONENT
============================================================ */

function Analytics() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [data, setData] = useState(null);
  const [liveEvents, setLiveEvents] = useState([]);
  const [isLive, setIsLive] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [activeSection, setActiveSection] = useState("overview");
  const [statusFilter, setStatusFilter] = useState("all");
  const [orderQuery, setOrderQuery] = useState("");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [chartView, setChartView] = useState("hourly");

  /* ---------- STOP & RESET CONTROLS STATE ---------- */
  const [isStreamStopped, setIsStreamStopped] = useState(false);
  const isStreamStoppedRef = useRef(false);
  const [resetKey, setResetKey] = useState(0);
  const [toastMsg, setToastMsg] = useState("");
  const toastTimeoutRef = useRef(null);

  const showToastNotification = (msg) => {
    setToastMsg(msg);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMsg("");
    }, 3200);
  };

  /* ---------- REFRESH LOGIC ---------- */

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

  const handleManualRefresh = async () => {
    setRefreshing(true);
    await refreshAnalytics();
    setTimeout(() => setRefreshing(false), 500);
  };

  /* ---------- STOP / RESUME STREAM HANDLER ---------- */
  const handleToggleStream = async () => {
    if (isStreamStopped) {
      // Resume stream
      isStreamStoppedRef.current = false;
      setIsStreamStopped(false);
      await refreshAnalytics();
      setLastUpdate(new Date());
      showToastNotification("Live stream resumed • Receiving real-time events");
    } else {
      // Stop stream
      isStreamStoppedRef.current = true;
      setIsStreamStopped(true);
      showToastNotification("Live stream stopped • Real-time updates paused");
    }
  };

  /* ---------- RESET ALL FROM START HANDLER ---------- */
  const handleResetAll = async () => {
    // 1. Clear live events feed
    setLiveEvents([]);
    // 2. Clear search and reset status filters
    setOrderQuery("");
    setStatusFilter("all");
    // 3. Increment resetKey to trigger count-up animation restart from 0
    setResetKey((prev) => prev + 1);
    // 4. Fetch fresh baseline data
    await refreshAnalytics();
    setLastUpdate(new Date());
    showToastNotification("Dashboard reset • Event stream cleared & counters restarted from zero");
  };

  /* ---------- INITIAL LOAD ---------- */

  useEffect(() => {
    let mounted = true;

    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const userResponse = await API.get("/auth/me");
        if (!userResponse.data?.success) {
          navigate("/login");
          return;
        }
        if (mounted) setUser(userResponse.data.user);

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
        if (mounted) setLoading(false);
      }
    };

    loadDashboard();
    return () => {
      mounted = false;
    };
  }, [navigate, refreshAnalytics]);

  /* ---------- SOCKET.IO (Supports Stop/Pause without breaking Backend) ---------- */

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => setIsLive(true));
    socket.on("connected", () => setIsLive(true));
    socket.on("disconnect", () => setIsLive(false));
    socket.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
      setIsLive(false);
    });

    socket.on("analyticsUpdated", async (payload) => {
      // If stream is stopped/paused by user, ignore incoming socket events
      if (isStreamStoppedRef.current) return;

      if (payload?.event) {
        setLiveEvents((prev) => [payload.event, ...prev].slice(0, 16));
      }
      await refreshAnalytics();
      setLastUpdate(new Date());
    });

    socket.on("liveEvent", (event) => {
      // If stream is stopped/paused by user, ignore incoming socket events
      if (isStreamStoppedRef.current) return;

      if (!event) return;
      setLiveEvents((prev) => [event, ...prev].slice(0, 16));
      setLastUpdate(new Date());
    });

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

  /* ---------- ACTIVE NAV HIGHLIGHT ---------- */

  useEffect(() => {
    if (!data) return undefined;
    const ids = NAV.map((n) => n.id).filter((id) => id !== "overview");
    const els = ids
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((e) => e.isIntersecting);
        if (visible) setActiveSection(visible.target.id);
        else if (window.scrollY < 200) setActiveSection("overview");
      },
      { rootMargin: "-30% 0px -55% 0px" }
    );

    els.forEach((el) => observer.observe(el));
    const onScroll = () => {
      if (window.scrollY < 200) setActiveSection("overview");
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, [data]);

  /* ---------- LOGOUT & NAVIGATION ---------- */

  const handleLogout = async () => {
    try {
      await API.post("/auth/logout");
    } catch (err) {
      console.error("Logout error:", err);
    }
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  const goTo = (id) => {
    setMobileSidebarOpen(false);
    if (id === "overview") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      setActiveSection("overview");
      return;
    }
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  /* ---------- SAFE DATA EXTRACTION & MEMOIZATION ---------- */

  const analytics = data?.analytics || {};
  const orders = data?.orders || [];

  const salesChartData = useMemo(() => {
    const salesList = data?.sales || [];
    if (salesList.length > 0) {
      return salesList.map((item) => ({
        name: item.name || item.date || "Day",
        sales: Number(item.sales || item.revenue || 0),
      }));
    }
    return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => ({
      name: d,
      sales: 0,
    }));
  }, [data?.sales]);

  const statusChart = useMemo(() => {
    const orderStatus = data?.orderStatus || {};
    return STATUS_META.map((s) => ({
      name: s.label,
      value: Number(orderStatus[s.key] || 0),
      color: s.color,
      bg: s.bg,
    }));
  }, [data?.orderStatus]);

  const statusTotal = useMemo(
    () => statusChart.reduce((sum, s) => sum + s.value, 0),
    [statusChart]
  );

  const productChartData = useMemo(() => {
    const topProducts = data?.products || [];
    return topProducts.slice(0, 6).map((p) => ({
      name: p.productName || p.title || "Product",
      sales: Number(p.sales || 0),
    }));
  }, [data?.products]);

  const statusCounts = useMemo(() => {
    const ordersList = data?.orders || [];
    const counts = { all: ordersList.length };
    ordersList.forEach((o) => {
      const k = (o.status || "").toLowerCase();
      counts[k] = (counts[k] || 0) + 1;
    });
    return counts;
  }, [data?.orders]);

  const filteredOrders = useMemo(() => {
    const ordersList = data?.orders || [];
    const q = orderQuery.trim().toLowerCase();
    return ordersList.filter((o) => {
      const matchStatus =
        statusFilter === "all" ||
        (o.status || "").toLowerCase() === statusFilter;
      const matchQuery =
        !q ||
        [o.orderId, o.customerName, o.customerEmail]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(q));
      return matchStatus && matchQuery;
    });
  }, [data?.orders, statusFilter, orderQuery]);

  const revenueAnimated = useCountUp(Number(analytics.revenue) || 0, 1100, resetKey);

  // Derived Average Order Value (AOV)
  const aov = useMemo(() => {
    const rev = Number(analytics.revenue || 0);
    const ord = Number(analytics.totalOrders || 0);
    return ord > 0 ? Math.round(rev / ord) : 0;
  }, [analytics.revenue, analytics.totalOrders]);

  /* ============================================================
     CONDITIONAL VIEWS
  ============================================================ */

  if (loading) {
    return (
      <>
        <style>{css}</style>
        <Skeleton />
      </>
    );
  }

  if (error) {
    return (
      <>
        <style>{css}</style>
        <div className="an-state">
          <div className="state-icon bad">
            <Activity size={32} />
          </div>
          <h2>We couldn't connect to your store data</h2>
          <p>{error}</p>
          <button className="btn-primary-action" onClick={() => window.location.reload()}>
            Reload Dashboard
          </button>
        </div>
      </>
    );
  }

  if (!data) {
    return (
      <>
        <style>{css}</style>
        <div className="an-state">
          <div className="state-icon">
            <Activity size={32} />
          </div>
          <h2>Waiting for live telemetry</h2>
          <p>Data will show up here as soon as events are streamed to the backend.</p>
        </div>
      </>
    );
  }

  const firstName = user?.firstName || "Admin";

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <>
      <style>{css}</style>

      <div className="an-page">
        {/* TOAST NOTIFICATION POPUP */}
        {toastMsg && (
          <div className="deluxe-toast-notification">
            <Sparkles size={15} className="toast-sparkle" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* MOBILE SIDEBAR BACKDROP */}
        {mobileSidebarOpen && (
          <div
            className="sidebar-backdrop"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}

        {/* ---------------- SIDEBAR ---------------- */}
        <aside className={`an-side ${mobileSidebarOpen ? "mobile-open" : ""}`}>
          {/* BRAND LOGO (CLICK TO RETURN HOME) */}
          <Link to="/" className="brand" title="Return to Shoplytics Homepage">
            <div className="brand-mark">
              <Zap size={20} />
            </div>
            <div className="brand-text">
              <strong>Shoplytics</strong>
              <span className="brand-tag">v2.4 Telemetry</span>
            </div>
          </Link>

          {/* SIDEBAR NAVIGATION */}
          <nav className="side-nav" aria-label="Dashboard sections">
            {/* PROMINENT LINK TO HOMEPAGE */}
            <Link to="/" className="side-link home-nav-link" title="Go to Storefront Homepage">
              <Home size={18} />
              <span>Homepage</span>
              <span className="home-link-pill">Exit</span>
            </Link>

            {/* DIRECT LINK TO PROFILE */}
            <Link to="/profile" className="side-link profile-nav-link" title="View Account Profile">
              <User size={18} />
              <span>My Profile</span>
            </Link>

            <div className="nav-divider-label">
              <span>ANALYTICS SECTIONS</span>
            </div>

            {NAV.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                className={`side-link ${activeSection === id ? "active" : ""}`}
                onClick={() => goTo(id)}
                aria-current={activeSection === id ? "true" : undefined}
              >
                <Icon size={18} />
                <span>{label}</span>
                {id === "overview" && <span className="nav-active-pip" />}
              </button>
            ))}
          </nav>

          {/* SIDEBAR FOOTER: TELEMETRY & LOGOUT */}
          <div className="side-bottom">
            <div className="telemetry-card">
              <div className="telemetry-top">
                <span className={`pulse-beacon ${isStreamStopped ? "paused" : isLive ? "on" : "off"}`} />
                <span className="telemetry-status-text">
                  {isStreamStopped ? "Stream Paused" : isLive ? "WebSockets Active" : "Disconnected"}
                </span>
                <span className="telemetry-ping">
                  {isStreamStopped ? "Paused" : isLive ? "<35ms" : "Offline"}
                </span>
              </div>
              <p className="telemetry-desc">
                {isStreamStopped
                  ? "Live updates temporarily stopped by user."
                  : isLive
                  ? "Bi-directional Socket.IO stream connected"
                  : "Trying to reconnect..."}
              </p>
            </div>

            <button className="side-link logout" onClick={handleLogout}>
              <LogOut size={18} />
              <span>Log out</span>
            </button>
          </div>
        </aside>

        {/* ---------------- MAIN DASHBOARD CONTENT ---------------- */}
        <main className="an-main">
          {/* TOP EXECUTIVE BAR */}
          <header className="top-dashboard-bar">
            <div className="top-left-group">
              <button
                className="btn-mobile-sidebar-toggle"
                onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
                aria-label="Toggle navigation menu"
              >
                <Menu size={20} />
              </button>

              <div className="top-titles">
                {/* PROMINENT SWITCHER: HOME & ANALYTICS SIDE-BY-SIDE */}
                <div className="top-nav-switcher">
                  <Link to="/" className="nav-switcher-tab">
                    <Home size={14} />
                    <span>Home</span>
                  </Link>

                  <span className="nav-switcher-tab active">
                    <BarChart3 size={14} />
                    <span>Live Analytics</span>
                    <span className={`switcher-pulse ${isStreamStopped ? "paused" : ""}`} />
                  </span>
                </div>

                <h1 className="dashboard-title">
                  {greeting()},{" "}
                  <span
                    className="title-user-gradient clickable-profile-name"
                    onClick={() => navigate("/profile")}
                    title="Click to view Profile"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") navigate("/profile");
                    }}
                  >
                    {firstName}
                  </span>
                </h1>
                <p className="dashboard-sub">
                  Live store performance • Socket.IO synchronized with backend
                </p>
              </div>
            </div>

            {/* ACTION CONTROLS & STOP/RESET BUTTONS */}
            <div className="top-actions-group">
              {/* LIVE SYNC STATUS PILL */}
              <div
                className={`live-sync-pill ${
                  isStreamStopped ? "paused" : isLive ? "on" : "off"
                }`}
              >
                <span className="live-pip" />
                <span className="live-label">
                  {isStreamStopped ? "STREAM STOPPED" : isLive ? "STREAMING" : "OFFLINE"}
                </span>
                <span className="live-timer">
                  {isStreamStopped ? "Updates paused" : `Synced ${formatTime(lastUpdate)}`}
                </span>
              </div>

              {/* REAL-TIME CONTROLS CAPSULE: STOP & RESET BUTTONS */}
              <div className="stream-control-capsule">
                {/* STOP / RESUME BUTTON */}
                <button
                  className={`btn-stream-ctrl ${isStreamStopped ? "resume" : "stop"}`}
                  onClick={handleToggleStream}
                  title={
                    isStreamStopped
                      ? "Resume live stream"
                      : "Stop/Pause live telemetry updates"
                  }
                >
                  {isStreamStopped ? (
                    <>
                      <Play size={13} fill="currentColor" />
                      <span>Resume</span>
                    </>
                  ) : (
                    <>
                      <Pause size={13} fill="currentColor" />
                      <span>Stop</span>
                    </>
                  )}
                </button>

                {/* RESET BUTTON */}
                <button
                  className="btn-stream-ctrl reset"
                  onClick={handleResetAll}
                  title="Clear live events and restart counters from start"
                >
                  <RotateCcw size={13} />
                  <span>Reset All</span>
                </button>
              </div>

              {/* REFRESH ICON */}
              <button
                className="btn-action-icon"
                onClick={handleManualRefresh}
                aria-label="Refresh Dashboard"
                title="Instant Data Refresh"
              >
                <RefreshCw size={17} className={refreshing ? "spin-rotate" : ""} />
              </button>

              {/* NOTIFICATION BELL */}
              <button
                className="btn-action-icon"
                aria-label="Live Activity Notifications"
                title="Live Activity Stream"
              >
                <Bell size={17} />
                {liveEvents.length > 0 && <span className="notification-ping-dot" />}
              </button>

              {/* USER PROFILE */}
              <div
                className="user-profile-badge clickable-profile-badge"
                onClick={() => navigate("/profile")}
                title="Click to view Account Profile"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") navigate("/profile");
                }}
              >
                <div className="user-avatar-gradient">
                  {firstName.charAt(0).toUpperCase()}
                </div>
                <div className="user-info-text">
                  <strong className="user-name">
                    {firstName} {user?.lastName || ""}
                  </strong>
                  <span className="user-role-label">Store Administrator</span>
                </div>
              </div>
            </div>
          </header>

          {/* ============================================================
              HERO: GMV REVENUE CHART & LIVE STREAM FEED
          ============================================================ */}
          <section className="dashboard-hero-grid" id="overview">
            {/* LEFT: REVENUE RECHARTS PANEL */}
            <div className="deluxe-panel hero-revenue-panel" id="sales-section">
              <div className="panel-glow-accent" />

              <div className="revenue-panel-top">
                <div className="revenue-headline-wrap">
                  <div className="hero-kpi-sub-label">
                    <Sparkles size={14} className="icon-sparkle-amber" />
                    <span>GROSS MERCHANDISE VALUE (GMV)</span>
                  </div>

                  <div className="revenue-main-figure">
                    <h2 className="revenue-number">
                      {inr(Math.round(revenueAnimated))}
                    </h2>
                    <Growth value={analytics.revenueGrowth} />
                  </div>

                  <div className="revenue-meta-strip">
                    <span className="meta-strip-item">
                      AOV: <strong className="highlight-white">{inr(aov)}</strong>
                    </span>
                    <span className="meta-separator">•</span>
                    <span className="meta-strip-item">
                      Orders: <strong className="highlight-white">{analytics.totalOrders || 0}</strong>
                    </span>
                    <span className="meta-separator">•</span>
                    <span className="meta-strip-item">
                      Status:{" "}
                      <strong className={isStreamStopped ? "highlight-amber" : "highlight-emerald"}>
                        {isStreamStopped ? "Stream Paused" : "Live Active"}
                      </strong>
                    </span>
                  </div>
                </div>

                {/* VIEW TABS */}
                <div className="revenue-view-tabs">
                  <button
                    className={`view-tab-btn ${chartView === "hourly" ? "active" : ""}`}
                    onClick={() => setChartView("hourly")}
                  >
                    Hourly
                  </button>
                  <button
                    className={`view-tab-btn ${chartView === "weekly" ? "active" : ""}`}
                    onClick={() => setChartView("weekly")}
                  >
                    Weekly
                  </button>
                </div>
              </div>

              {/* RECHARTS AREA GRAPH */}
              <div className="revenue-chart-canvas">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={salesChartData}
                    margin={{ top: 15, right: 12, left: -4, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="deluxeRevFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6366f1" stopOpacity="0.5" />
                        <stop offset="60%" stopColor="#8b5cf6" stopOpacity="0.12" />
                        <stop offset="100%" stopColor="#07090e" stopOpacity="0" />
                      </linearGradient>
                      <linearGradient id="deluxeStrokeGrad" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#6366f1" />
                        <stop offset="50%" stopColor="#8b5cf6" />
                        <stop offset="100%" stopColor="#06b6d4" />
                      </linearGradient>
                    </defs>

                    <CartesianGrid
                      stroke="rgba(255, 255, 255, 0.05)"
                      strokeDasharray="4 6"
                      vertical={false}
                    />

                    <XAxis
                      dataKey="name"
                      stroke="#64748b"
                      tickLine={false}
                      axisLine={false}
                      fontSize={12}
                      tickMargin={10}
                      fontFamily="var(--font-mono)"
                    />

                    <YAxis
                      stroke="#64748b"
                      tickLine={false}
                      axisLine={false}
                      fontSize={12}
                      width={52}
                      tickMargin={8}
                      fontFamily="var(--font-mono)"
                      tickFormatter={(v) =>
                        v >= 1000 ? `₹${Math.round(v / 1000)}k` : `₹${v}`
                      }
                    />

                    <Tooltip
                      cursor={{
                        stroke: "rgba(99, 102, 241, 0.5)",
                        strokeWidth: 1.5,
                        strokeDasharray: "4 4",
                      }}
                      content={<ChartTooltip money />}
                    />

                    <Area
                      type="monotone"
                      dataKey="sales"
                      stroke="url(#deluxeStrokeGrad)"
                      strokeWidth={3}
                      fill="url(#deluxeRevFill)"
                      activeDot={{
                        r: 6,
                        stroke: "#07090e",
                        strokeWidth: 3,
                        fill: "#06b6d4",
                      }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* RIGHT: LIVE EVENT STREAM */}
            <div className="deluxe-panel live-stream-panel">
              <div className="panel-glow-accent blue" />

              <div className="stream-panel-header">
                <div className="stream-header-text">
                  <div className="stream-title-row">
                    <span className={`stream-pulse-ring ${isStreamStopped ? "paused" : ""}`} />
                    <h3>Live Customer Telemetry</h3>
                  </div>
                  <p>Real-time customer journey actions</p>
                </div>

                {/* MINI STREAM CONTROLS IN HEADER */}
                <div className="stream-header-actions">
                  <button
                    className={`stream-mini-btn ${isStreamStopped ? "resume" : "pause"}`}
                    onClick={handleToggleStream}
                    title={isStreamStopped ? "Resume stream" : "Stop / pause stream"}
                  >
                    {isStreamStopped ? (
                      <Play size={12} fill="currentColor" />
                    ) : (
                      <Pause size={12} fill="currentColor" />
                    )}
                  </button>

                  <button
                    className="stream-mini-btn reset"
                    onClick={handleResetAll}
                    title="Clear feed and restart from zero"
                  >
                    <RotateCcw size={12} />
                  </button>

                  <div className="stream-event-counter">
                    <span className="counter-num">{liveEvents.length}</span>
                    <span className="counter-text">Events</span>
                  </div>
                </div>
              </div>

              {/* PAUSED BANNER IF STOPPED */}
              {isStreamStopped && (
                <div className="stream-paused-alert-bar">
                  <div className="paused-alert-left">
                    <Pause size={13} className="paused-alert-icon" />
                    <span>Real-time stream is stopped. Incoming events are paused.</span>
                  </div>
                  <button className="btn-resume-mini" onClick={handleToggleStream}>
                    <Play size={11} fill="currentColor" />
                    <span>Resume</span>
                  </button>
                </div>
              )}

              {/* EVENT FEED LIST */}
              <div className="stream-feed-list">
                {liveEvents.length === 0 ? (
                  <div className="stream-empty-state">
                    <Activity size={32} className="empty-icon-pulse" />
                    <strong>{isStreamStopped ? "Stream is stopped" : "Listening for incoming events..."}</strong>
                    <p>
                      {isStreamStopped
                        ? "Click 'Resume' above to start receiving real-time events again."
                        : "Customer searches, carts, checkouts and orders will appear here dynamically."}
                    </p>
                  </div>
                ) : (
                  liveEvents.map((event, index) => {
                    const meta = eventMeta(event.type);
                    return (
                      <div
                        className="stream-event-row"
                        key={
                          event._id ||
                          `${event.type}-${event.createdAt || event.timestamp || ""}-${index}`
                        }
                      >
                        <div className={`event-icon-avatar ${meta.tone}`}>
                          {meta.icon}
                        </div>

                        <div className="event-details">
                          <div className="event-title-line">
                            <strong className="event-type-name">
                              {formatEventType(event.type)}
                            </strong>
                            <span className={`event-tag-pill ${meta.tone}`}>
                              {meta.badge}
                            </span>
                          </div>
                          <span className="event-target-desc">
                            {event.productName ||
                              event.product?.title ||
                              event.orderId ||
                              "Customer interaction recorded"}
                          </span>
                        </div>

                        <div className="event-amount-col">
                          <strong className="event-amount-val">
                            {event.amount ? inr(event.amount) : "Live"}
                          </strong>
                          <span className="event-time-ago">
                            {formatTime(event.createdAt || event.timestamp)}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </section>

          {/* ============================================================
              KPI CARDS MATRIX (4 KEY EXECUTIVE METRICS)
          ============================================================ */}
          <section className="dashboard-kpis-grid">
            <KpiCard
              title="Total Store Orders"
              value={analytics.totalOrders}
              growth={analytics.orderGrowth}
              icon={<ShoppingCart size={20} />}
              tone="kpi-sky"
              subtitle="All lifetime orders"
              resetKey={resetKey}
            />
            <KpiCard
              title="Active Customers"
              value={analytics.customers}
              growth={analytics.customerGrowth}
              icon={<Users size={20} />}
              tone="kpi-violet"
              subtitle="Registered & active buyers"
              resetKey={resetKey}
            />
            <KpiCard
              title="Catalog Products"
              value={analytics.products}
              growth={analytics.productGrowth}
              icon={<Package size={20} />}
              tone="kpi-mint"
              subtitle="Synced inventory items"
              resetKey={resetKey}
            />
            <KpiCard
              title="Average Order Value"
              value={aov}
              growth={analytics.revenueGrowth}
              icon={<CircleDollarSign size={20} />}
              tone="kpi-amber"
              subtitle="Per completed checkout"
              resetKey={resetKey}
            />
          </section>

          {/* ============================================================
              SPLIT: ORDER STATUS DONUT & PRODUCT LEADERBOARD
          ============================================================ */}
          <section className="dashboard-split-grid" id="customers-section">
            {/* DONUT: ORDER STATUS BREAKDOWN */}
            <div className="deluxe-panel donut-status-panel">
              <div className="panel-glow-accent emerald" />

              <div className="panel-inner-header">
                <div>
                  <h3 className="panel-h3">Fulfillment Status Distribution</h3>
                  <p className="panel-sub">Breakdown of orders across shipment phases</p>
                </div>
                <span className="header-stat-pill">
                  {statusTotal.toLocaleString("en-IN")} Total
                </span>
              </div>

              <div className="donut-content-layout">
                {/* DONUT CHART */}
                <div className="donut-chart-container">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={
                          statusTotal > 0
                            ? statusChart
                            : [{ name: "No orders", value: 1, color: "#1e293b" }]
                        }
                        dataKey="value"
                        nameKey="name"
                        innerRadius="68%"
                        outerRadius="94%"
                        paddingAngle={statusTotal > 0 ? 5 : 0}
                        stroke="none"
                        cornerRadius={8}
                      >
                        {(statusTotal > 0
                          ? statusChart
                          : [{ color: "#1e293b" }]
                        ).map((s, i) => (
                          <Cell key={i} fill={s.color} />
                        ))}
                      </Pie>
                      {statusTotal > 0 && <Tooltip content={<ChartTooltip />} />}
                    </PieChart>
                  </ResponsiveContainer>

                  <div className="donut-center-overlay">
                    <strong className="center-num-total">
                      {statusTotal.toLocaleString("en-IN")}
                    </strong>
                    <span className="center-label-caption">ORDERS</span>
                  </div>
                </div>

                {/* STATUS LEGEND BREAKDOWN */}
                <div className="status-legend-list">
                  {statusChart.map((s) => {
                    const pct = statusTotal > 0 ? Math.round((s.value / statusTotal) * 100) : 0;
                    return (
                      <div className="status-legend-item" key={s.name}>
                        <div className="legend-row-top">
                          <span
                            className="status-color-swatch"
                            style={{ backgroundColor: s.color }}
                          />
                          <span className="legend-status-title">{s.name}</span>
                          <strong className="legend-status-count">{s.value}</strong>
                          <span className="legend-pct-badge">{pct}%</span>
                        </div>
                        <div className="legend-progress-track">
                          <div
                            className="legend-progress-bar"
                            style={{
                              width: `${pct}%`,
                              backgroundColor: s.color,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* BAR CHART: TOP PRODUCTS LEADERBOARD */}
            <div className="deluxe-panel products-ranking-panel">
              <div className="panel-glow-accent amber" />

              <div className="panel-inner-header">
                <div>
                  <h3 className="panel-h3">Top Products Leaderboard</h3>
                  <p className="panel-sub">Best-selling inventory by total units sold</p>
                </div>
                <span className="header-stat-pill">Ranked</span>
              </div>

              <div className="products-chart-box">
                {productChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={productChartData}
                      layout="vertical"
                      margin={{ top: 8, right: 24, left: 10, bottom: 4 }}
                    >
                      <CartesianGrid
                        stroke="rgba(255,255,255,0.05)"
                        strokeDasharray="4 6"
                        horizontal={false}
                      />
                      <XAxis type="number" hide />
                      <YAxis
                        type="category"
                        dataKey="name"
                        stroke="#94a3b8"
                        tickLine={false}
                        axisLine={false}
                        fontSize={12}
                        width={130}
                        tickFormatter={(v) =>
                          v.length > 18 ? `${v.slice(0, 18)}…` : v
                        }
                      />
                      <Tooltip
                        cursor={{ fill: "rgba(255,255,255,0.04)" }}
                        content={<ChartTooltip />}
                      />
                      <Bar
                        dataKey="sales"
                        fill="#6366f1"
                        radius={[0, 8, 8, 0]}
                        barSize={18}
                      >
                        {productChartData.map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={
                              index === 0
                                ? "#818cf8"
                                : index === 1
                                ? "#6366f1"
                                : index === 2
                                ? "#4f46e5"
                                : "#4338ca"
                            }
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="stream-empty-state">
                    <Package size={32} />
                    <strong>No product sales yet</strong>
                    <p>Your store's best selling inventory will rank here automatically.</p>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* ============================================================
              RECENT ORDERS INTELLIGENCE TABLE
          ============================================================ */}
          <section className="deluxe-panel orders-panel" id="orders-section">
            <div className="orders-header-toolbar">
              <div className="orders-title-wrap">
                <h3 className="panel-h3">Recent Orders Stream</h3>
                <p className="panel-sub">
                  Showing {filteredOrders.length} of {orders.length} orders
                </p>
              </div>

              {/* SEARCH INPUT */}
              <div className="orders-search-wrapper">
                <Search size={16} className="search-icon-muted" />
                <input
                  type="text"
                  className="orders-search-input"
                  value={orderQuery}
                  onChange={(e) => setOrderQuery(e.target.value)}
                  placeholder="Search order ID, customer or email..."
                  aria-label="Search Orders"
                />
                {orderQuery && (
                  <button
                    className="btn-clear-search"
                    onClick={() => setOrderQuery("")}
                    aria-label="Clear Search"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* STATUS FILTER CHIPS */}
            <div className="status-chips-filter-bar">
              {[{ key: "all", label: "All Orders" }, ...STATUS_META].map((s) => (
                <button
                  key={s.key}
                  className={`filter-chip ${statusFilter === s.key ? "active" : ""}`}
                  onClick={() => setStatusFilter(s.key)}
                >
                  <span>{s.label}</span>
                  <span className="chip-count-pill">
                    {statusCounts[s.key] || 0}
                  </span>
                </button>
              ))}
            </div>

            {/* ORDERS TABLE */}
            <div className="orders-table-scroll-wrap">
              {filteredOrders.length === 0 ? (
                <div className="stream-empty-state">
                  <ShoppingCart size={32} />
                  <strong>
                    {orders.length === 0 ? "No orders found" : "No orders matching query"}
                  </strong>
                  <p>
                    {orders.length === 0
                      ? "New store orders will automatically flow in here."
                      : "Try adjusting your search query or status filter above."}
                  </p>
                </div>
              ) : (
                <table className="deluxe-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th className="th-email">Email</th>
                      <th className="th-right">Total Amount</th>
                      <th>Fulfillment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((order) => {
                      const st = (order.status || "").toLowerCase();
                      return (
                        <tr key={order._id}>
                          <td>
                            <div className="table-order-id-cell">
                              <CreditCard size={15} className="id-icon-violet" />
                              <span className="order-id-text">{order.orderId}</span>
                            </div>
                          </td>
                          <td>
                            <div className="table-customer-cell">
                              <span className="customer-avatar-dot">
                                {(order.customerName || "C").charAt(0).toUpperCase()}
                              </span>
                              <span className="customer-name-text">
                                {order.customerName}
                              </span>
                            </div>
                          </td>
                          <td className="th-email">
                            <span className="customer-email-text">
                              {order.customerEmail}
                            </span>
                          </td>
                          <td className="th-right">
                            <strong className="order-amount-text">
                              {inr(order.totalAmount)}
                            </strong>
                          </td>
                          <td>
                            <span className={`order-status-badge ${st}`}>
                              <span className="badge-glow-dot" />
                              <span className="badge-status-label">{order.status}</span>
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </section>
        </main>
      </div>
    </>
  );
}

/* ============================================================
   DELUXE EXECUTIVE STYLES FOR ANALYTICS
============================================================ */

const css = `
:root {
  --bg-deep: #07090e;
  --bg-surface: #0c101d;
  --bg-panel: #101626;
  --bg-panel-hover: #141c30;
  --border-subtle: rgba(255, 255, 255, 0.08);
  --border-hover: rgba(99, 102, 241, 0.4);

  --indigo: #6366f1;
  --indigo-glow: rgba(99, 102, 241, 0.35);
  --cyan: #06b6d4;
  --emerald: #10b981;
  --amber: #f59e0b;
  --rose: #f43f5e;
  --violet: #8b5cf6;

  --text-main: #f8fafc;
  --text-sub: #cbd5e1;
  --text-muted: #8492a6;
  --text-dim: #64748b;

  --font-main: "Plus Jakarta Sans", "Inter", system-ui, sans-serif;
  --font-mono: "JetBrains Mono", monospace;
}

.an-page {
  min-height: 100vh;
  background-color: var(--bg-deep);
  color: var(--text-main);
  font-family: var(--font-main);
  display: flex;
  position: relative;
  background-image:
    radial-gradient(1000px 500px at 85% -10%, rgba(99, 102, 241, 0.12), transparent 60%),
    radial-gradient(800px 450px at 0% 100%, rgba(16, 185, 129, 0.08), transparent 60%);
}

/* ---------- TOAST NOTIFICATION ---------- */

.deluxe-toast-notification {
  position: fixed;
  top: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 20px;
  border-radius: 30px;
  background: rgba(16, 22, 38, 0.94);
  border: 1px solid rgba(99, 102, 241, 0.5);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6), 0 0 25px rgba(99, 102, 241, 0.25);
  backdrop-filter: blur(12px);
  font-size: 13.5px;
  font-weight: 700;
  color: #fff;
  animation: slideDownToast 0.3s ease;
}

@keyframes slideDownToast {
  from { opacity: 0; transform: translate(-50%, -15px); }
  to { opacity: 1; transform: translate(-50%, 0); }
}

.toast-sparkle {
  color: #818cf8;
  flex-shrink: 0;
}

/* ---------- SIDEBAR ---------- */

.an-side {
  position: fixed;
  inset: 0 auto 0 0;
  width: 250px;
  padding: 24px 16px 20px;
  display: flex;
  flex-direction: column;
  background: rgba(12, 16, 29, 0.95);
  border-right: 1px solid var(--border-subtle);
  backdrop-filter: blur(20px);
  z-index: 50;
  transition: transform 0.25s ease;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 8px 24px;
  text-decoration: none;
  color: inherit;
}

.brand-mark {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  box-shadow: 0 4px 18px rgba(99, 102, 241, 0.45);
}

.brand-text strong {
  display: block;
  font-size: 19px;
  font-weight: 800;
  letter-spacing: -0.5px;
  color: #fff;
}

.brand-tag {
  font-size: 11px;
  color: #818cf8;
  font-weight: 600;
}

.side-nav {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.side-link {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 11px 14px;
  border-radius: 10px;
  border: 1px solid transparent;
  background: transparent;
  color: var(--text-muted);
  font-size: 14px;
  font-weight: 600;
  text-align: left;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.2s ease;
  position: relative;
}

.side-link:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.08);
}

.side-link.active {
  color: #fff;
  background: linear-gradient(90deg, rgba(99, 102, 241, 0.2), rgba(99, 102, 241, 0.05));
  border-color: rgba(99, 102, 241, 0.4);
}

.nav-active-pip {
  margin-left: auto;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #6366f1;
  box-shadow: 0 0 10px #6366f1;
}

.home-nav-link {
  color: #cbd5e1;
  background: rgba(255, 255, 255, 0.03);
  border-color: var(--border-subtle);
  margin-bottom: 6px;
}

.home-nav-link:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
}

.home-link-pill {
  margin-left: auto;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.1);
  color: #cbd5e1;
}

.nav-divider-label {
  padding: 12px 14px 4px;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1px;
  color: #475569;
}

.side-bottom {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.telemetry-card {
  padding: 14px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid var(--border-subtle);
}

.telemetry-top {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.pulse-beacon {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--rose);
}

.pulse-beacon.on {
  background: var(--emerald);
  box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
  animation: pulseGlow 1.8s infinite;
}

.pulse-beacon.paused {
  background: var(--amber);
  box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.7);
}

.telemetry-status-text {
  font-size: 12px;
  font-weight: 700;
  color: #fff;
  flex: 1;
}

.telemetry-ping {
  font-size: 10px;
  font-family: var(--font-mono);
  color: #34d399;
}

.telemetry-desc {
  font-size: 11px;
  color: var(--text-dim);
  margin: 0;
  line-height: 1.4;
}

.side-link.logout:hover {
  color: var(--rose);
  background: rgba(244, 63, 94, 0.1);
}

/* ---------- MAIN DASHBOARD AREA ---------- */

.an-main {
  margin-left: 250px;
  flex: 1;
  padding: 28px 36px 60px;
  min-width: 0;
}

/* ---------- HEADER ---------- */

.top-dashboard-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 30px;
}

.top-left-group {
  display: flex;
  align-items: center;
  gap: 16px;
}

.btn-mobile-sidebar-toggle {
  display: none;
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  color: #fff;
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
}

.top-nav-switcher {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: rgba(0, 0, 0, 0.4);
  padding: 4px;
  border-radius: 10px;
  border: 1px solid var(--border-subtle);
  margin-bottom: 8px;
}

.nav-switcher-tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border-radius: 7px;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-muted);
  text-decoration: none;
  transition: all 0.2s;
}

.nav-switcher-tab:hover {
  color: #fff;
}

.nav-switcher-tab.active {
  background: rgba(99, 102, 241, 0.2);
  color: #a5b4fc;
  border: 1px solid rgba(99, 102, 241, 0.4);
}

.switcher-pulse {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--emerald);
  animation: pulseGlow 1.8s infinite;
}

.switcher-pulse.paused {
  background: var(--amber);
  animation: none;
}

.dashboard-title {
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -0.8px;
  color: #ffffff;
  margin: 0;
}

.title-user-gradient {
  background: linear-gradient(135deg, #a5b4fc, #818cf8);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.dashboard-sub {
  font-size: 13.5px;
  color: var(--text-muted);
  margin: 4px 0 0;
}

.top-actions-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* LIVE STATUS PILL */
.live-sync-pill {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 13px;
  border-radius: 20px;
  background: rgba(12, 16, 29, 0.85);
  border: 1px solid var(--border-subtle);
  backdrop-filter: blur(8px);
}

.live-pip {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--rose);
}

.live-sync-pill.on .live-pip {
  background: var(--emerald);
  box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
  animation: pulseGlow 1.8s infinite;
}

.live-sync-pill.paused {
  border-color: rgba(245, 158, 11, 0.4);
  background: rgba(245, 158, 11, 0.08);
}

.live-sync-pill.paused .live-pip {
  background: var(--amber);
  box-shadow: 0 0 6px rgba(245, 158, 11, 0.6);
  animation: none;
}

.live-sync-pill.paused .live-label {
  color: #fbbf24;
}

.live-label {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.6px;
  color: #fff;
}

.live-timer {
  font-size: 11px;
  color: var(--text-muted);
  border-left: 1px solid var(--border-subtle);
  padding-left: 8px;
}

/* ---------- REAL-TIME CONTROLS CAPSULE ---------- */

.stream-control-capsule {
  display: flex;
  align-items: center;
  background: rgba(12, 16, 29, 0.85);
  border: 1px solid var(--border-subtle);
  padding: 3px;
  border-radius: 12px;
  gap: 3px;
}

.btn-stream-ctrl {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 9px;
  border: none;
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-stream-ctrl.stop {
  background: rgba(244, 63, 94, 0.12);
  color: #fda4af;
  border: 1px solid rgba(244, 63, 94, 0.3);
}

.btn-stream-ctrl.stop:hover {
  background: rgba(244, 63, 94, 0.24);
  color: #fff;
  border-color: rgba(244, 63, 94, 0.6);
}

.btn-stream-ctrl.resume {
  background: #10b981;
  color: #042f2e;
  box-shadow: 0 2px 10px rgba(16, 185, 129, 0.35);
}

.btn-stream-ctrl.resume:hover {
  background: #34d399;
}

.btn-stream-ctrl.reset {
  background: rgba(255, 255, 255, 0.05);
  color: #cbd5e1;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.btn-stream-ctrl.reset:hover {
  background: rgba(99, 102, 241, 0.2);
  color: #fff;
  border-color: rgba(99, 102, 241, 0.4);
}

.btn-action-icon {
  width: 38px;
  height: 38px;
  border-radius: 11px;
  background: rgba(12, 16, 29, 0.85);
  border: 1px solid var(--border-subtle);
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
  transition: all 0.2s;
}

.btn-action-icon:hover {
  color: #fff;
  border-color: rgba(99, 102, 241, 0.5);
  background: rgba(99, 102, 241, 0.1);
}

.spin-rotate {
  animation: spinSlow 0.6s linear infinite;
}

.notification-ping-dot {
  position: absolute;
  top: 9px;
  right: 9px;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--amber);
}

.user-profile-badge {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 5px 12px 5px 5px;
  border-radius: 14px;
  background: rgba(12, 16, 29, 0.85);
  border: 1px solid var(--border-subtle);
}

.clickable-profile-name {
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 4px;
}

.clickable-profile-name:hover {
  filter: drop-shadow(0 0 10px rgba(99, 102, 241, 0.7));
  text-decoration: underline;
  text-decoration-color: rgba(129, 140, 248, 0.6);
  text-underline-offset: 4px;
}

.clickable-profile-badge {
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
}

.clickable-profile-badge:hover {
  background: rgba(99, 102, 241, 0.15);
  border-color: rgba(99, 102, 241, 0.5);
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.25);
}

.clickable-profile-badge:active {
  transform: translateY(0);
}

.user-avatar-gradient {
  width: 32px;
  height: 32px;
  border-radius: 9px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #fff;
  font-size: 13px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-name {
  display: block;
  font-size: 12.5px;
  color: #fff;
}

.user-role-label {
  font-size: 10.5px;
  color: var(--text-muted);
}

/* ---------- DELUXE PANELS ---------- */

.deluxe-panel {
  background: var(--bg-panel);
  border: 1px solid var(--border-subtle);
  border-radius: 20px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 14px 40px rgba(0, 0, 0, 0.35);
  transition: border-color 0.2s ease, transform 0.2s ease;
}

.deluxe-panel:hover {
  border-color: rgba(99, 102, 241, 0.35);
}

.panel-glow-accent {
  position: absolute;
  top: 0;
  left: 20px;
  right: 20px;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.4), transparent);
  pointer-events: none;
}

.panel-glow-accent.blue {
  background: linear-gradient(90deg, transparent, rgba(6, 182, 212, 0.4), transparent);
}

.panel-glow-accent.emerald {
  background: linear-gradient(90deg, transparent, rgba(16, 185, 129, 0.4), transparent);
}

.panel-glow-accent.amber {
  background: linear-gradient(90deg, transparent, rgba(245, 158, 11, 0.4), transparent);
}

/* ---------- DASHBOARD HERO: REVENUE & LIVE STREAM ---------- */

.dashboard-hero-grid {
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 22px;
  margin-bottom: 24px;
}

.hero-revenue-panel {
  padding: 26px 26px 14px;
  display: flex;
  flex-direction: column;
}

.revenue-panel-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 14px;
}

.hero-kpi-sub-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11.5px;
  font-weight: 700;
  letter-spacing: 0.8px;
  color: #a5b4fc;
  margin-bottom: 4px;
}

.icon-sparkle-amber {
  color: var(--amber);
}

.revenue-main-figure {
  display: flex;
  align-items: center;
  gap: 14px;
}

.revenue-number {
  font-size: 44px;
  font-weight: 800;
  letter-spacing: -1.6px;
  color: #fff;
  font-family: var(--font-mono);
  margin: 0;
}

.revenue-meta-strip {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 6px;
  font-size: 12.5px;
  color: var(--text-muted);
}

.meta-separator { color: var(--border-subtle); }
.highlight-white { color: #fff; font-family: var(--font-mono); }
.highlight-emerald { color: #34d399; font-weight: 700; }
.highlight-amber { color: #fbbf24; font-weight: 700; }

.revenue-view-tabs {
  display: flex;
  gap: 4px;
  background: rgba(0, 0, 0, 0.35);
  padding: 3px;
  border-radius: 9px;
  border: 1px solid var(--border-subtle);
}

.view-tab-btn {
  font-size: 11.5px;
  font-weight: 700;
  padding: 5px 12px;
  border-radius: 7px;
  background: transparent;
  color: var(--text-muted);
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.view-tab-btn.active {
  background: #6366f1;
  color: #fff;
}

.revenue-chart-canvas {
  height: 275px;
  width: 100%;
}

/* ---------- LIVE STREAM PANEL ---------- */

.live-stream-panel {
  display: flex;
  flex-direction: column;
  max-height: 440px;
}

.stream-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 22px 14px;
  border-bottom: 1px solid var(--border-subtle);
}

.stream-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stream-title-row h3 {
  font-size: 16px;
  font-weight: 700;
  color: #fff;
  margin: 0;
}

.stream-header-text p {
  font-size: 12px;
  color: var(--text-muted);
  margin: 2px 0 0;
}

.stream-pulse-ring {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #06b6d4;
  animation: pulseGlow 1.6s infinite;
}

.stream-pulse-ring.paused {
  background: var(--amber);
  animation: none;
}

.stream-header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stream-mini-btn {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-subtle);
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.stream-mini-btn:hover {
  background: rgba(99, 102, 241, 0.2);
  color: #fff;
  border-color: rgba(99, 102, 241, 0.4);
}

.stream-mini-btn.resume {
  background: rgba(16, 185, 129, 0.2);
  color: #34d399;
  border-color: rgba(16, 185, 129, 0.4);
}

.stream-event-counter {
  display: flex;
  align-items: baseline;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 20px;
  background: rgba(6, 182, 212, 0.1);
  border: 1px solid rgba(6, 182, 212, 0.3);
}

.counter-num {
  font-size: 13px;
  font-weight: 800;
  color: #06b6d4;
  font-family: var(--font-mono);
}

.counter-text {
  font-size: 11px;
  font-weight: 600;
  color: #67e8f9;
}

.stream-paused-alert-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 9px 16px;
  background: rgba(245, 158, 11, 0.1);
  border-bottom: 1px solid rgba(245, 158, 11, 0.25);
  font-size: 12px;
  color: #fbbf24;
}

.paused-alert-left {
  display: flex;
  align-items: center;
  gap: 6px;
}

.paused-alert-icon {
  color: #f59e0b;
}

.btn-resume-mini {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 3px 9px;
  border-radius: 6px;
  background: #f59e0b;
  color: #451a03;
  border: none;
  font-size: 11px;
  font-weight: 800;
  cursor: pointer;
  transition: filter 0.2s;
}

.btn-resume-mini:hover {
  filter: brightness(1.1);
}

.stream-feed-list {
  overflow-y: auto;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.stream-event-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  transition: all 0.2s ease;
}

.stream-event-row:hover {
  background: rgba(255, 255, 255, 0.03);
}

.event-icon-avatar {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.tone-sky { background: rgba(56, 189, 248, 0.15); color: #38bdf8; }
.tone-amber { background: rgba(245, 158, 11, 0.15); color: #f59e0b; }
.tone-mint { background: rgba(16, 185, 129, 0.15); color: #10b981; }
.tone-violet { background: rgba(129, 140, 248, 0.15); color: #818cf8; }

.event-details {
  flex: 1;
  min-width: 0;
}

.event-title-line {
  display: flex;
  align-items: center;
  gap: 8px;
}

.event-type-name {
  font-size: 13px;
  font-weight: 700;
  color: #fff;
}

.event-tag-pill {
  font-size: 10px;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 6px;
}

.event-tag-pill.tone-mint { background: rgba(16, 185, 129, 0.2); color: #34d399; }
.event-tag-pill.tone-amber { background: rgba(245, 158, 11, 0.2); color: #fbbf24; }
.event-tag-pill.tone-sky { background: rgba(56, 189, 248, 0.2); color: #38bdf8; }
.event-tag-pill.tone-violet { background: rgba(129, 140, 248, 0.2); color: #a5b4fc; }

.event-target-desc {
  display: block;
  font-size: 12px;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 2px;
}

.event-amount-col {
  text-align: right;
  flex-shrink: 0;
}

.event-amount-val {
  display: block;
  font-size: 13px;
  font-weight: 700;
  color: #fff;
  font-family: var(--font-mono);
}

.event-time-ago {
  font-size: 11px;
  color: var(--text-dim);
}

.stream-empty-state {
  padding: 40px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: var(--text-muted);
  gap: 8px;
}

.stream-empty-state strong {
  color: #fff;
  font-size: 14.5px;
}

.stream-empty-state p {
  font-size: 12.5px;
  max-width: 280px;
  margin: 0;
}

/* ---------- KPI CARDS ROW ---------- */

.dashboard-kpis-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.kpi-card-deluxe {
  background: var(--bg-panel);
  border: 1px solid var(--border-subtle);
  border-radius: 18px;
  padding: 20px;
  position: relative;
  overflow: hidden;
  transition: transform 0.2s ease, border-color 0.2s ease;
}

.kpi-card-deluxe:hover {
  transform: translateY(-2px);
  border-color: rgba(99, 102, 241, 0.4);
}

.kpi-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.kpi-icon-wrapper {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.kpi-sky .kpi-icon-wrapper { background: rgba(56, 189, 248, 0.14); color: #38bdf8; }
.kpi-violet .kpi-icon-wrapper { background: rgba(139, 92, 246, 0.14); color: #a78bfa; }
.kpi-mint .kpi-icon-wrapper { background: rgba(16, 185, 129, 0.14); color: #10b981; }
.kpi-amber .kpi-icon-wrapper { background: rgba(245, 158, 11, 0.14); color: #f59e0b; }

.growth-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 8px;
  font-size: 11.5px;
  font-weight: 700;
  font-family: var(--font-mono);
}

.growth-chip.up {
  color: #34d399;
  background: rgba(16, 185, 129, 0.12);
}

.growth-chip.down {
  color: #fb7185;
  background: rgba(244, 63, 94, 0.12);
}

.kpi-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-muted);
}

.kpi-value {
  font-size: 30px;
  font-weight: 800;
  letter-spacing: -0.8px;
  color: #fff;
  margin: 4px 0 10px;
  font-family: var(--font-mono);
}

.kpi-bottom {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.kpi-sub-text {
  font-size: 11.5px;
  color: var(--text-dim);
}

.kpi-spark-bar {
  height: 4px;
  width: 100%;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.06);
  overflow: hidden;
}

.kpi-spark-fill {
  height: 100%;
  width: 65%;
  border-radius: 4px;
  background: linear-gradient(90deg, #6366f1, #06b6d4);
}

/* ---------- SPLIT GRID: DONUT & PRODUCTS ---------- */

.dashboard-split-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 22px;
  margin-bottom: 24px;
}

.panel-inner-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 14px;
  border-bottom: 1px solid var(--border-subtle);
}

.panel-h3 {
  font-size: 16px;
  font-weight: 700;
  color: #fff;
  margin: 0;
}

.panel-sub {
  font-size: 12px;
  color: var(--text-muted);
  margin: 2px 0 0;
}

.header-stat-pill {
  font-size: 11.5px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-subtle);
  color: #cbd5e1;
}

.donut-content-layout {
  display: flex;
  align-items: center;
  padding: 22px 24px;
  gap: 24px;
}

.donut-chart-container {
  width: 190px;
  height: 190px;
  position: relative;
  flex-shrink: 0;
}

.donut-center-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.center-num-total {
  font-size: 30px;
  font-weight: 800;
  color: #fff;
  font-family: var(--font-mono);
}

.center-label-caption {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1px;
  color: var(--text-muted);
}

.status-legend-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.status-legend-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.legend-row-top {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.status-color-swatch {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.legend-status-title {
  color: var(--text-sub);
  flex: 1;
}

.legend-status-count {
  font-family: var(--font-mono);
  color: #fff;
}

.legend-pct-badge {
  font-size: 11px;
  font-family: var(--font-mono);
  color: var(--text-dim);
  width: 32px;
  text-align: right;
}

.legend-progress-track {
  height: 5px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.06);
  overflow: hidden;
}

.legend-progress-bar {
  height: 100%;
  border-radius: 4px;
  transition: width 0.4s ease;
}

.products-chart-box {
  height: 250px;
  padding: 14px 18px;
}

/* ---------- ORDERS TABLE DELUXE ---------- */

.orders-panel {
  margin-bottom: 24px;
}

.orders-header-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 22px 24px 14px;
  flex-wrap: wrap;
}

.orders-search-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 14px;
  height: 40px;
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.35);
  border: 1px solid var(--border-subtle);
  color: var(--text-muted);
  min-width: 300px;
}

.orders-search-wrapper:focus-within {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
}

.orders-search-input {
  background: transparent;
  border: none;
  outline: none;
  color: #fff;
  font-size: 13.5px;
  flex: 1;
}

.orders-search-input::placeholder {
  color: #64748b;
}

.btn-clear-search {
  background: transparent;
  border: none;
  color: var(--text-dim);
  cursor: pointer;
  padding: 2px;
}

.btn-clear-search:hover { color: #fff; }

.status-chips-filter-bar {
  display: flex;
  gap: 8px;
  padding: 12px 24px 16px;
  border-bottom: 1px solid var(--border-subtle);
  overflow-x: auto;
}

.filter-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 20px;
  border: 1px solid var(--border-subtle);
  background: transparent;
  color: var(--text-muted);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.filter-chip:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.05);
}

.chip-count-pill {
  font-size: 11px;
  font-family: var(--font-mono);
  padding: 1px 7px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.08);
}

.filter-chip.active {
  background: #6366f1;
  border-color: #6366f1;
  color: #fff;
}

.filter-chip.active .chip-count-pill {
  background: rgba(0, 0, 0, 0.25);
  color: #fff;
}

.orders-table-scroll-wrap {
  overflow-x: auto;
}

.deluxe-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.deluxe-table th {
  padding: 13px 24px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  color: #64748b;
  border-bottom: 1px solid var(--border-subtle);
  background: rgba(0, 0, 0, 0.2);
}

.deluxe-table td {
  padding: 15px 24px;
  font-size: 13.5px;
  color: #cbd5e1;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  transition: background 0.15s;
}

.deluxe-table tbody tr:hover td {
  background: rgba(99, 102, 241, 0.05);
}

.table-order-id-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.id-icon-violet {
  color: #818cf8;
}

.order-id-text {
  font-family: var(--font-mono);
  font-weight: 700;
  color: #fff;
}

.table-customer-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.customer-avatar-dot {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 800;
  color: #fff;
}

.customer-name-text {
  font-weight: 600;
  color: #f1f5f9;
}

.customer-email-text {
  color: var(--text-muted);
  font-size: 13px;
}

.th-right {
  text-align: right;
}

.order-amount-text {
  font-family: var(--font-mono);
  color: #fff;
  font-size: 14px;
}

.order-status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 11px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  text-transform: capitalize;
}

.badge-glow-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.order-status-badge.delivered {
  background: rgba(16, 185, 129, 0.14);
  color: #34d399;
}
.order-status-badge.delivered .badge-glow-dot { background: #10b981; }

.order-status-badge.processing {
  background: rgba(56, 189, 248, 0.14);
  color: #38bdf8;
}
.order-status-badge.processing .badge-glow-dot { background: #38bdf8; }

.order-status-badge.pending {
  background: rgba(245, 158, 11, 0.14);
  color: #fbbf24;
}
.order-status-badge.pending .badge-glow-dot { background: #f59e0b; }

.order-status-badge.cancelled {
  background: rgba(244, 63, 94, 0.14);
  color: #fb7185;
}
.order-status-badge.cancelled .badge-glow-dot { background: #f43f5e; }

/* ---------- TOOLTIP & STATE SCREENS ---------- */

.chart-tooltip-deluxe {
  background: #0f172a;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 10px;
  padding: 10px 14px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6);
}

.tooltip-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
}

.tooltip-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #6366f1;
}

.tooltip-label {
  font-size: 11.5px;
  color: var(--text-muted);
}

.tooltip-val {
  font-size: 15px;
  font-weight: 800;
  color: #fff;
  font-family: var(--font-mono);
}

.an-state {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 30px;
  gap: 12px;
}

.state-icon {
  width: 64px;
  height: 64px;
  border-radius: 18px;
  background: rgba(99, 102, 241, 0.15);
  color: #818cf8;
  display: flex;
  align-items: center;
  justify-content: center;
}

.state-icon.bad {
  background: rgba(244, 63, 94, 0.15);
  color: #f43f5e;
}

.btn-primary-action {
  padding: 12px 24px;
  border-radius: 11px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: #fff;
  border: none;
  font-weight: 700;
  font-size: 14.5px;
  cursor: pointer;
  margin-top: 10px;
  box-shadow: 0 4px 18px rgba(99, 102, 241, 0.4);
}

/* ---------- SKELETON LOADERS ---------- */

.sk-shell {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.sk {
  border-radius: 16px;
  background: linear-gradient(90deg, #111726 25%, #1a233a 50%, #111726 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
}

.sk-title { height: 44px; width: 320px; }
.sk-hero { height: 370px; }
.sk-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
.sk-kpi { height: 135px; }

@keyframes shimmer {
  to { background-position: -200% 0; }
}

/* ---------- RESPONSIVE MEDIA QUERIES ---------- */

@media (max-width: 1250px) {
  .dashboard-kpis-grid { grid-template-columns: repeat(2, 1fr); }
  .dashboard-hero-grid { grid-template-columns: 1fr; }
  .dashboard-split-grid { grid-template-columns: 1fr; }
}

@media (max-width: 950px) {
  .an-side {
    transform: translateX(-100%);
    box-shadow: 12px 0 35px rgba(0, 0, 0, 0.6);
  }
  .an-side.mobile-open {
    transform: translateX(0);
  }
  .sidebar-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.7);
    z-index: 45;
  }
  .btn-mobile-sidebar-toggle {
    display: block;
  }
  .an-main {
    margin-left: 0;
    padding: 20px 16px 40px;
  }
  .dashboard-kpis-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 680px) {
  .top-dashboard-bar {
    flex-direction: column;
    align-items: flex-start;
  }
  .top-actions-group {
    flex-wrap: wrap;
    width: 100%;
  }
  .revenue-number {
    font-size: 32px;
  }
  .th-email {
    display: none;
  }
  .donut-content-layout {
    flex-direction: column;
  }
  .orders-search-wrapper {
    min-width: 0;
    width: 100%;
  }
}
`;

export default Analytics;