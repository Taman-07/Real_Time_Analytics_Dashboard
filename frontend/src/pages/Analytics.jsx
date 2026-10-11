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
  CircleDollarSign,
  CreditCard,
  Eye,
  Home,
  Package,
  Pause,
  Play,
  RefreshCw,
  Search,
  ShoppingCart,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Users,
  X,
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

// Status colours match the "Order status" card on the Home page
const STATUS_META = [
  { key: "delivered", label: "Delivered", color: "#10b981" },
  { key: "processing", label: "Processing", color: "#f59e0b" },
  { key: "pending", label: "Pending", color: "#60a5fa" },
  { key: "cancelled", label: "Cancelled", color: "#fb7185" },
];

const BAR_COLORS = ["#1e3a8a", "#1d4ed8", "#2563eb", "#3b82f6", "#60a5fa", "#93c5fd"];

const inr = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

/* ============================================================
   HOOKS & HELPERS
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
      return { icon: <Search size={16} />, tone: "tone-violet", badge: "Search" };
    case "PRODUCT_VIEWED":
      return { icon: <Eye size={16} />, tone: "tone-sky", badge: "Viewed" };
    case "PRODUCT_ADDED_TO_CART":
      return { icon: <ShoppingCart size={16} />, tone: "tone-amber", badge: "Cart" };
    case "CHECKOUT_STARTED":
      return { icon: <CreditCard size={16} />, tone: "tone-amber", badge: "Checkout" };
    case "ORDER_CREATED":
      return { icon: <Package size={16} />, tone: "tone-mint", badge: "New order" };
    case "PAYMENT_COMPLETED":
      return { icon: <CircleDollarSign size={16} />, tone: "tone-mint", badge: "Paid" };
    default:
      return { icon: <Activity size={16} />, tone: "tone-sky", badge: "Activity" };
  }
}

/* ============================================================
   CHART DATA HELPERS
============================================================ */

const toPoints = (list) =>
  list.map((item) => ({
    name: item.name || item.label || item.date || item.hour || "",
    sales: Number(item.sales ?? item.revenue ?? item.total ?? 0),
  }));

const orderDate = (o) => {
  const d = new Date(o.createdAt || o.orderDate || o.date || o.timestamp);
  return Number.isNaN(d.getTime()) ? null : d;
};

const isCancelled = (o) => (o.status || "").toLowerCase() === "cancelled";

/* ============================================================
   SUB-COMPONENTS
============================================================ */

function ChartTooltip({ active, payload, label, money = false }) {
  if (!active || !payload?.length) return null;
  const v = payload[0].value;
  return (
    <div className="chart-tooltip">
      <div className="tooltip-label">{label || payload[0].name}</div>
      <div className="tooltip-val">
        {money ? inr(v) : Number(v).toLocaleString("en-IN")}
      </div>
    </div>
  );
}

function Growth({ value, onDark = false }) {
  const n = Number(value ?? 0);
  const down = n < 0;
  return (
    <span className={`growth-chip ${down ? "down" : "up"}${onDark ? " on-dark" : ""}`}>
      {down ? <TrendingDown size={13} /> : <TrendingUp size={13} />}
      <span>
        {down ? "" : "+"}
        {n}%
      </span>
    </span>
  );
}

function KpiCard({ title, value, growth, icon, subtitle = "vs previous period" }) {
  const animated = useCountUp(Number(value) || 0, 900);
  return (
    <div className="kpi-card">
      <div className="kpi-top">
        <span className="tone-icon">{icon}</span>
        <Growth value={growth} />
      </div>

      <span className="kpi-title">{title}</span>
      <h3 className="kpi-value">{Math.round(animated).toLocaleString("en-IN")}</h3>
      <span className="kpi-sub-text">{subtitle}</span>
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
  const [statusFilter, setStatusFilter] = useState("all");
  const [orderQuery, setOrderQuery] = useState("");
  const [chartView, setChartView] = useState("weekly");

  /* ---------- STOP & RESET CONTROLS STATE ---------- */
  const [isStreamStopped, setIsStreamStopped] = useState(false);
  const isStreamStoppedRef = useRef(false);
  const [toastMsg, setToastMsg] = useState("");
  const toastTimeoutRef = useRef(null);

  const showToastNotification = (msg) => {
    setToastMsg(msg);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMsg("");
    }, 3200);
  };

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, []);

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
      isStreamStoppedRef.current = false;
      setIsStreamStopped(false);
      await refreshAnalytics();
      setLastUpdate(new Date());
      showToastNotification("Live stream resumed • Receiving real-time events");
    } else {
      isStreamStoppedRef.current = true;
      setIsStreamStopped(true);
      showToastNotification("Live stream stopped • Real-time updates paused");
    }
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

  /* ---------- SOCKET.IO ---------- */

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
      if (isStreamStoppedRef.current) return;

      if (payload?.event) {
        setLiveEvents((prev) => [payload.event, ...prev].slice(0, 16));
      }
      await refreshAnalytics();
      setLastUpdate(new Date());
    });

    socket.on("liveEvent", (event) => {
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

  /* ---------- SAFE DATA EXTRACTION & MEMOIZATION ---------- */

  const analytics = data?.analytics || {};
  const orders = data?.orders || [];

  const weeklyData = useMemo(() => {
    if (data?.salesWeekly?.length) return toPoints(data.salesWeekly);
    if (data?.sales?.length) return toPoints(data.sales);

    // Fallback: last 7 days built from the orders list
    const now = new Date();
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      days.push({
        key: d.toDateString(),
        name: d.toLocaleDateString("en-IN", { weekday: "short" }),
        sales: 0,
      });
    }
    (data?.orders || []).forEach((o) => {
      if (isCancelled(o)) return;
      const d = orderDate(o);
      if (!d) return;
      const slot = days.find((x) => x.key === d.toDateString());
      if (slot) slot.sales += Number(o.totalAmount || 0);
    });
    return days.map(({ name, sales }) => ({ name, sales }));
  }, [data]);

  const hourlyData = useMemo(() => {
    if (data?.salesHourly?.length) return toPoints(data.salesHourly);

    // Fallback: last 12 hours built from the orders list
    const now = new Date();
    const slots = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        now.getHours() - i
      );
      slots.push({
        key: `${d.toDateString()}-${d.getHours()}`,
        name: d.toLocaleTimeString("en-IN", { hour: "numeric", hour12: true }),
        sales: 0,
      });
    }
    (data?.orders || []).forEach((o) => {
      if (isCancelled(o)) return;
      const d = orderDate(o);
      if (!d) return;
      const slot = slots.find((x) => x.key === `${d.toDateString()}-${d.getHours()}`);
      if (slot) slot.sales += Number(o.totalAmount || 0);
    });
    return slots.map(({ name, sales }) => ({ name, sales }));
  }, [data]);

  const salesChartData = chartView === "hourly" ? hourlyData : weeklyData;

  const statusChart = useMemo(() => {
    const orderStatus = data?.orderStatus || {};
    return STATUS_META.map((s) => ({
      name: s.label,
      value: Number(orderStatus[s.key] || 0),
      color: s.color,
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

  const revenueAnimated = useCountUp(Number(analytics.revenue) || 0, 1100);

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
            Reload dashboard
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
          <h2>Waiting for live data</h2>
          <p>Data will show up here as soon as events are sent to the backend.</p>
        </div>
      </>
    );
  }

  const firstName = user?.firstName || "Admin";
  const statusKey = isStreamStopped ? "paused" : isLive ? "on" : "off";

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <>
      <style>{css}</style>

      <div className="an-page">
        {toastMsg && (
          <div className="toast-notification" role="status">
            <Sparkles size={15} className="toast-sparkle" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* ============================================================
            HERO: HOME BUTTON, GREETING, CONTROLS, REVENUE + LIVE FEED
        ============================================================ */}
        <section className="an-hero">
          <div className="an-container">
            {/* TOP ROW: Home pill on the right */}
            <div className="an-top-row">
              <Link to="/" className="nav-user" title="Go to homepage">
                <span className="nav-avatar">
                  <Home size={14} />
                </span>
                <span className="nav-user-name">Go to homepage</span>
              </Link>
            </div>

            {/* TITLE + CONTROLS */}
            <div className="an-title-row">
              <div>
                <h1 className="hero-title">
                  {greeting()},{" "}
                  <Link to="/profile" className="hero-accent" title="View profile">
                    {firstName}
                  </Link>
                </h1>
                <p className="hero-desc">
                  Live store performance, updated the moment something happens.
                </p>
              </div>

              <div className="an-controls">
                <div className={`live-sync-pill ${statusKey}`}>
                  <span className="live-pip" />
                  <span className="live-label">
                    {isStreamStopped ? "STREAM STOPPED" : isLive ? "STREAMING" : "OFFLINE"}
                  </span>
                  <span className="live-timer">
                    {isStreamStopped ? "Updates paused" : `Synced ${formatTime(lastUpdate)}`}
                  </span>
                </div>

                <div className="stream-control-capsule">
                  <button
                    className={`btn-stream-ctrl ${isStreamStopped ? "resume" : "stop"}`}
                    onClick={handleToggleStream}
                    title={isStreamStopped ? "Resume live stream" : "Pause live updates"}
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
                </div>

                <button
                  className="btn-action-icon"
                  onClick={handleManualRefresh}
                  aria-label="Refresh dashboard"
                  title="Refresh data"
                >
                  <RefreshCw size={17} className={refreshing ? "spin-rotate" : ""} />
                </button>
              </div>
            </div>

            {/* REVENUE CARD + LIVE FEED */}
            <div className="hero-grid">
              <div className="revenue-card">
                <div className="revenue-top">
                  <div>
                    <span className="hv-title">Total revenue</span>
                    <div className="revenue-main-figure">
                      <h2 className="revenue-number">
                        {inr(Math.round(revenueAnimated))}
                      </h2>
                      <Growth value={analytics.revenueGrowth} onDark />
                    </div>

                    <div className="revenue-meta-strip">
                      <span>
                        Avg. order <strong>{inr(aov)}</strong>
                      </span>
                      <span className="meta-separator" aria-hidden="true">|</span>
                      <span>
                        Orders <strong>{analytics.totalOrders || 0}</strong>
                      </span>
                      <span className="meta-separator" aria-hidden="true">|</span>
                      <span>
                        <strong className={isStreamStopped ? "text-amber" : "text-emerald"}>
                          {isStreamStopped ? "Paused" : "Live"}
                        </strong>
                      </span>
                    </div>
                  </div>

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

                <div className="revenue-chart-canvas">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={salesChartData}
                      margin={{ top: 15, right: 12, left: -4, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="anRevFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#bfdbfe" stopOpacity="0.4" />
                          <stop offset="100%" stopColor="#bfdbfe" stopOpacity="0" />
                        </linearGradient>
                      </defs>

                      <CartesianGrid
                        stroke="rgba(255,255,255,0.14)"
                        strokeDasharray="4 4"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="name"
                        stroke="#a9b8dc"
                        tickLine={false}
                        axisLine={false}
                        fontSize={12}
                        tickMargin={10}
                      />
                      <YAxis
                        stroke="#a9b8dc"
                        tickLine={false}
                        axisLine={false}
                        fontSize={12}
                        width={52}
                        tickMargin={8}
                        tickFormatter={(v) =>
                          v >= 1000 ? `₹${Math.round(v / 1000)}k` : `₹${v}`
                        }
                      />
                      <Tooltip
                        cursor={{
                          stroke: "rgba(191, 219, 254, 0.6)",
                          strokeWidth: 1.5,
                          strokeDasharray: "4 4",
                        }}
                        content={<ChartTooltip money />}
                      />
                      <Area
                        type="monotone"
                        dataKey="sales"
                        stroke="#bfdbfe"
                        strokeWidth={3}
                        fill="url(#anRevFill)"
                        activeDot={{
                          r: 5.5,
                          stroke: "#1e40af",
                          strokeWidth: 2,
                          fill: "#bfdbfe",
                        }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* LIVE FEED */}
              <div className="feed-card">
                <div className="feed-header">
                  <div>
                    <div className="feed-title-row">
                      <span className={`feed-dot ${isStreamStopped ? "paused" : ""}`} />
                      <h3>Live customer activity</h3>
                    </div>
                    <p>What shoppers are doing right now</p>
                  </div>

                  <div className="feed-header-actions">
                    <button
                      className="feed-mini-btn"
                      onClick={handleToggleStream}
                      title={isStreamStopped ? "Resume stream" : "Pause stream"}
                      aria-label={isStreamStopped ? "Resume stream" : "Pause stream"}
                    >
                      {isStreamStopped ? (
                        <Play size={12} fill="currentColor" />
                      ) : (
                        <Pause size={12} fill="currentColor" />
                      )}
                    </button>                    <span className="feed-counter">
                      <strong>{liveEvents.length}</strong> events
                    </span>
                  </div>
                </div>

                {isStreamStopped && (
                  <div className="feed-paused-bar">
                    <span>Stream is stopped. New events are paused.</span>
                    <button onClick={handleToggleStream}>
                      <Play size={11} fill="currentColor" />
                      <span>Resume</span>
                    </button>
                  </div>
                )}

                <div className="feed-list">
                  {liveEvents.length === 0 ? (
                    <div className="empty-state">
                      <Activity size={30} />
                      <strong>
                        {isStreamStopped ? "Stream is stopped" : "Listening for events"}
                      </strong>
                      <p>
                        {isStreamStopped
                          ? "Press Resume to start receiving events again."
                          : "Searches, carts, checkouts and orders will appear here as they happen."}
                      </p>
                    </div>
                  ) : (
                    liveEvents.map((event, index) => {
                      const meta = eventMeta(event.type);
                      return (
                        <div
                          className="feed-row"
                          key={
                            event._id ||
                            `${event.type}-${event.createdAt || event.timestamp || ""}-${index}`
                          }
                        >
                          <div className={`event-icon ${meta.tone}`}>{meta.icon}</div>

                          <div className="event-details">
                            <div className="event-title-line">
                              <strong>{formatEventType(event.type)}</strong>
                              <span className={`event-tag ${meta.tone}`}>{meta.badge}</span>
                            </div>
                            <span className="event-target">
                              {event.productName ||
                                event.product?.title ||
                                event.orderId ||
                                "Customer interaction recorded"}
                            </span>
                          </div>

                          <div className="event-amount-col">
                            <strong>{event.amount ? inr(event.amount) : "Live"}</strong>
                            <span>{formatTime(event.createdAt || event.timestamp)}</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================
            KPI CARDS
        ============================================================ */}
        <section className="an-section">
          <div className="an-container">
            <div className="section-head">
              <h2 className="section-title">Your store at a glance</h2>
              <p className="section-subtitle">
                The numbers that matter most, compared with the previous period.
              </p>
            </div>

            <div className="kpi-grid">
              <KpiCard
                title="Total orders"
                value={analytics.totalOrders}
                growth={analytics.orderGrowth}
                icon={<ShoppingCart size={20} />}
                subtitle="All lifetime orders"
              />
              <KpiCard
                title="Active customers"
                value={analytics.customers}
                growth={analytics.customerGrowth}
                icon={<Users size={20} />}
                subtitle="Registered and active buyers"
              />
              <KpiCard
                title="Catalog products"
                value={analytics.products}
                growth={analytics.productGrowth}
                icon={<Package size={20} />}
                subtitle="Items in your inventory"
              />
              <KpiCard
                title="Average order value"
                value={aov}
                growth={analytics.revenueGrowth}
                icon={<CircleDollarSign size={20} />}
                subtitle="Revenue per order"
              />
            </div>
          </div>
        </section>

        {/* ============================================================
            ORDER STATUS + TOP PRODUCTS
        ============================================================ */}
        <section className="an-section grey">
          <div className="an-container">
            <div className="section-head">
              <h2 className="section-title">Fulfillment and best sellers</h2>
              <p className="section-subtitle">
                Where your orders stand and which products are pulling their weight.
              </p>
            </div>

            <div className="split-grid">
              <div className="panel">
                <div className="panel-head">
                  <div>
                    <h3 className="panel-h3">Order status</h3>
                    <p className="panel-sub">Orders across each delivery stage</p>
                  </div>
                  <span className="header-pill">
                    {statusTotal.toLocaleString("en-IN")} total
                  </span>
                </div>

                <div className="donut-layout">
                  <div className="donut-box">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={
                            statusTotal > 0
                              ? statusChart
                              : [{ name: "No orders", value: 1, color: "#cfe0fa" }]
                          }
                          dataKey="value"
                          nameKey="name"
                          innerRadius="68%"
                          outerRadius="94%"
                          paddingAngle={statusTotal > 0 ? 4 : 0}
                          stroke="none"
                          cornerRadius={6}
                        >
                          {(statusTotal > 0
                            ? statusChart
                            : [{ color: "#cfe0fa" }]
                          ).map((s, i) => (
                            <Cell key={i} fill={s.color} />
                          ))}
                        </Pie>
                        {statusTotal > 0 && <Tooltip content={<ChartTooltip />} />}
                      </PieChart>
                    </ResponsiveContainer>

                    <div className="donut-center">
                      <strong>{statusTotal.toLocaleString("en-IN")}</strong>
                      <span>Orders</span>
                    </div>
                  </div>

                  <div className="status-legend-list">
                    {statusChart.map((s) => {
                      const pct =
                        statusTotal > 0 ? Math.round((s.value / statusTotal) * 100) : 0;
                      return (
                        <div className="status-legend-item" key={s.name}>
                          <div className="legend-row-top">
                            <span
                              className="status-swatch"
                              style={{ backgroundColor: s.color }}
                            />
                            <span className="legend-title">{s.name}</span>
                            <strong className="legend-count">{s.value}</strong>
                            <span className="legend-pct">{pct}%</span>
                          </div>
                          <div className="legend-track">
                            <div
                              className="legend-bar"
                              style={{ width: `${pct}%`, backgroundColor: s.color }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="panel">
                <div className="panel-head">
                  <div>
                    <h3 className="panel-h3">Top products</h3>
                    <p className="panel-sub">Best sellers by units sold</p>
                  </div>
                  <span className="header-pill">Ranked</span>
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
                          stroke="#d0e1fb"
                          strokeDasharray="4 6"
                          horizontal={false}
                        />
                        <XAxis type="number" hide />
                        <YAxis
                          type="category"
                          dataKey="name"
                          stroke="#475569"
                          tickLine={false}
                          axisLine={false}
                          fontSize={12}
                          width={130}
                          tickFormatter={(v) =>
                            v.length > 18 ? `${v.slice(0, 18)}…` : v
                          }
                        />
                        <Tooltip
                          cursor={{ fill: "rgba(37, 99, 235, 0.08)" }}
                          content={<ChartTooltip />}
                        />
                        <Bar dataKey="sales" radius={[0, 8, 8, 0]} barSize={18}>
                          {productChartData.map((_, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={BAR_COLORS[index % BAR_COLORS.length]}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="empty-state">
                      <Package size={30} />
                      <strong>No product sales yet</strong>
                      <p>Your best sellers will be ranked here automatically.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================
            RECENT ORDERS
        ============================================================ */}
        <section className="an-section" id="orders-section">
          <div className="an-container">
            <div className="section-head">
              <h2 className="section-title">Recent orders</h2>
              <p className="section-subtitle">
                Search by order ID, customer name or email, and filter by status.
              </p>
            </div>

            <div className="panel orders-panel">
              <div className="orders-toolbar">
                <p className="panel-sub orders-count">
                  Showing {filteredOrders.length} of {orders.length} orders
                </p>

                <div className="orders-search-wrapper">
                  <Search size={16} />
                  <input
                    type="text"
                    className="orders-search-input"
                    value={orderQuery}
                    onChange={(e) => setOrderQuery(e.target.value)}
                    placeholder="Search order ID, customer or email"
                    aria-label="Search orders"
                  />
                  {orderQuery && (
                    <button
                      className="btn-clear-search"
                      onClick={() => setOrderQuery("")}
                      aria-label="Clear search"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>

              <div className="status-chips-bar">
                {[{ key: "all", label: "All orders" }, ...STATUS_META].map((s) => (
                  <button
                    key={s.key}
                    className={`filter-chip ${statusFilter === s.key ? "active" : ""}`}
                    onClick={() => setStatusFilter(s.key)}
                  >
                    <span>{s.label}</span>
                    <span className="chip-count">{statusCounts[s.key] || 0}</span>
                  </button>
                ))}
              </div>

              <div className="orders-table-scroll">
                {filteredOrders.length === 0 ? (
                  <div className="empty-state">
                    <ShoppingCart size={30} />
                    <strong>
                      {orders.length === 0 ? "No orders yet" : "No orders match your search"}
                    </strong>
                    <p>
                      {orders.length === 0
                        ? "New store orders will show up here automatically."
                        : "Try a different search or status filter."}
                    </p>
                  </div>
                ) : (
                  <table className="orders-table">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th className="th-email">Email</th>
                        <th className="th-right">Total</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.map((order) => {
                        const st = (order.status || "").toLowerCase();
                        return (
                          <tr key={order._id}>
                            <td>
                              <div className="table-id-cell">
                                <CreditCard size={15} />
                                <span className="order-id-text">{order.orderId}</span>
                              </div>
                            </td>
                            <td>
                              <div className="table-customer-cell">
                                <span className="customer-avatar">
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
                                <span className="badge-dot" />
                                <span>{order.status}</span>
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

/* ============================================================
   STYLES (same design tokens as Home.jsx)
============================================================ */

const css = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');

.an-page, .an-state {
  --navy: #0f1a2e;
  --navy-2: #1e3a8a;
  --blue: #2563eb;
  --blue-soft: #93c5fd;
  --card: #eaf2ff;
  --card-border: #d0e1fb;
  --card-border-hover: #93b8f3;
  --ink: #0b1220;
  --text: #475569;
  --line: #e2e8f0;
  --bg: #ffffff;
  --bg-soft: #f6f9ff;
  --bg-grey: #f1f3f6;
  --black: #0a0a0c;
  --deep-blue: #111827;
  --hero-card: #172554;
  --hero-card-border: #2c4390;
  --emerald: #10b981;
  --amber: #f59e0b;
  --rose: #fb7185;
  font-family: Outfit, Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  color: var(--ink);
}

.an-page, .an-state { box-sizing: border-box; }
.an-page *, .an-state * { box-sizing: border-box; }

.an-page {
  min-height: 100vh;
  background: var(--bg);
  overflow-x: clip;
  position: relative;
}

.an-container { max-width: 1200px; margin: 0 auto; }

/* ---------- TOAST ---------- */

.toast-notification {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  display: flex;
  align-items: center;
  gap: 10px;
  max-width: calc(100vw - 32px);
  padding: 11px 20px;
  border-radius: 30px;
  background: var(--navy);
  border: 1px solid var(--hero-card-border);
  box-shadow: 0 10px 30px rgba(15, 26, 46, 0.35);
  font-size: 13.5px;
  font-weight: 600;
  color: #fff;
  animation: toastIn 0.3s ease;
}

@keyframes toastIn {
  from { opacity: 0; transform: translate(-50%, -12px); }
  to { opacity: 1; transform: translate(-50%, 0); }
}

.toast-sparkle { color: #bfdbfe; flex-shrink: 0; }

/* ---------- HERO ---------- */

.an-hero {
  background: var(--deep-blue);
  padding: 28px 24px 70px;
}

.an-top-row {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 16px;
  margin-bottom: 44px;
}

/* Same pill as the "Hello, username" button on Home */
.nav-user {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 5px 14px 5px 5px;
  border-radius: 30px;
  text-decoration: none;
  color: #fff;
  font-size: 15px;
  font-weight: 800;
  border: 1px solid rgba(255, 255, 255, 0.25);
  background: rgba(255, 255, 255, 0.08);
  transition: border-color 0.2s ease, background 0.2s ease;
}

.nav-user:hover {
  border-color: #fff;
  background: rgba(255, 255, 255, 0.16);
}

.nav-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12.5px;
  font-weight: 800;
  color: var(--black);
  background: #fff;
}

.nav-user-name { white-space: nowrap; }

.an-title-row {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  flex-wrap: wrap;
  margin-bottom: 34px;
}

.hero-title {
  font-size: clamp(34px, 4.2vw, 54px);
  font-weight: 800;
  line-height: 1.08;
  letter-spacing: -1.6px;
  color: #fff;
  margin: 0 0 14px;
}

.hero-accent { color: #bfdbfe; text-decoration: none; }
.hero-accent:hover { text-decoration: underline; text-underline-offset: 6px; text-decoration-thickness: 3px; }

.hero-desc {
  font-size: 18px;
  line-height: 1.6;
  color: #dbe6ff;
  max-width: 540px;
  margin: 0;
}

.an-controls { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }

.live-sync-pill {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.22);
}

.live-pip { width: 7px; height: 7px; border-radius: 50%; background: var(--rose); }

.live-sync-pill.on .live-pip {
  background: var(--emerald);
  box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
  animation: pulseGlow 1.8s infinite;
}

.live-sync-pill.paused { border-color: rgba(245, 158, 11, 0.5); background: rgba(245, 158, 11, 0.1); }
.live-sync-pill.paused .live-pip { background: var(--amber); }
.live-sync-pill.paused .live-label { color: #fbbf24; }

.live-label { font-size: 11px; font-weight: 800; letter-spacing: 0.6px; color: #fff; }

.live-timer {
  font-size: 12px;
  color: #c5d3f0;
  border-left: 1px solid rgba(255, 255, 255, 0.2);
  padding-left: 8px;
  font-variant-numeric: tabular-nums;
}

.stream-control-capsule {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 3px;
  border-radius: 13px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.22);
}

.btn-stream-ctrl {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 13px;
  border-radius: 10px;
  border: 1px solid transparent;
  font: inherit;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-stream-ctrl.stop {
  background: rgba(244, 63, 94, 0.14);
  color: #fda4af;
  border-color: rgba(244, 63, 94, 0.35);
}
.btn-stream-ctrl.stop:hover { background: rgba(244, 63, 94, 0.28); color: #fff; }

.btn-stream-ctrl.resume { background: #10b981; color: #042f2e; }
.btn-stream-ctrl.resume:hover { background: #34d399; }

.btn-action-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.22);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-action-icon:hover { background: rgba(255, 255, 255, 0.16); border-color: rgba(255, 255, 255, 0.4); }

.spin-rotate { animation: spinSlow 0.6s linear infinite; }

@keyframes spinSlow { to { transform: rotate(360deg); } }

@keyframes pulseGlow {
  0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.6); }
  70% { box-shadow: 0 0 0 7px rgba(16, 185, 129, 0); }
  100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
}

/* ---------- HERO GRID: REVENUE + FEED ---------- */

.hero-grid {
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 22px;
  align-items: stretch;
}

.revenue-card {
  padding: 26px 26px 14px;
  border-radius: 22px;
  background: var(--hero-card);
  border: 1px solid var(--hero-card-border);
  display: flex;
  flex-direction: column;
}

.revenue-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 14px;
}

.hv-title { font-size: 14px; font-weight: 600; color: #c5d3f0; }

.revenue-main-figure { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; margin-top: 4px; }

.revenue-number {
  font-size: 44px;
  font-weight: 800;
  letter-spacing: -1.4px;
  color: #fff;
  margin: 0;
  font-variant-numeric: tabular-nums;
}

.revenue-meta-strip {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 6px;
  font-size: 13px;
  color: #a9b8dc;
}

.revenue-meta-strip strong { color: #fff; font-variant-numeric: tabular-nums; }
.revenue-meta-strip .text-emerald { color: #34d399; }
.revenue-meta-strip .text-amber { color: #fbbf24; }
.meta-separator { color: rgba(255, 255, 255, 0.25); }

.revenue-view-tabs {
  display: flex;
  gap: 4px;
  padding: 3px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.14);
}

.view-tab-btn {
  font: inherit;
  font-size: 12px;
  font-weight: 700;
  padding: 5px 13px;
  border-radius: 7px;
  background: transparent;
  color: #c5d3f0;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.view-tab-btn.active { background: #fff; color: var(--deep-blue); }

.revenue-chart-canvas { height: 275px; width: 100%; }

.growth-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 9px;
  border-radius: 14px;
  font-size: 12.5px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.growth-chip.up { color: #047857; background: rgba(16, 185, 129, 0.16); }
.growth-chip.down { color: #be123c; background: rgba(244, 63, 94, 0.14); }
.growth-chip.up.on-dark { color: #34d399; background: rgba(16, 185, 129, 0.18); }
.growth-chip.down.on-dark { color: #fda4af; background: rgba(244, 63, 94, 0.2); }

/* ---------- LIVE FEED (white card, like the floating cards on Home) ---------- */

.feed-card {
  display: flex;
  flex-direction: column;
  max-height: 440px;
  border-radius: 22px;
  background: #fff;
  border: 1px solid var(--card-border);
  box-shadow: 0 8px 22px rgba(15, 26, 46, 0.1);
  overflow: hidden;
}

.feed-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 18px 20px 14px;
  border-bottom: 1px solid var(--line);
}

.feed-title-row { display: flex; align-items: center; gap: 8px; }
.feed-title-row h3 { font-size: 16px; font-weight: 700; color: var(--ink); margin: 0; }
.feed-header p { font-size: 12.5px; color: var(--text); margin: 2px 0 0; }

.feed-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--emerald);
  animation: pulseGlow 1.6s infinite;
}
.feed-dot.paused { background: var(--amber); animation: none; }

.feed-header-actions { display: flex; align-items: center; gap: 6px; }

.feed-mini-btn {
  width: 30px;
  height: 30px;
  border-radius: 9px;
  background: var(--card);
  border: 1px solid var(--card-border);
  color: var(--navy);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}
.feed-mini-btn:hover { background: var(--navy); color: #fff; border-color: var(--navy); }

.feed-counter {
  font-size: 12px;
  color: var(--text);
  padding: 4px 10px;
  border-radius: 20px;
  background: var(--bg-soft);
  border: 1px solid var(--card-border);
  white-space: nowrap;
}
.feed-counter strong { color: var(--ink); font-variant-numeric: tabular-nums; }

.feed-paused-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 9px 16px;
  background: #fffbeb;
  border-bottom: 1px solid #fde68a;
  font-size: 12.5px;
  color: #92400e;
}

.feed-paused-bar button {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 7px;
  background: var(--amber);
  color: #451a03;
  border: none;
  font: inherit;
  font-size: 11.5px;
  font-weight: 800;
  cursor: pointer;
}

.feed-list { overflow-y: auto; flex: 1; display: flex; flex-direction: column; }

.feed-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  border-bottom: 1px solid var(--line);
  animation: rowIn 0.35s ease both;
}
.feed-row:hover { background: var(--bg-soft); }

@keyframes rowIn { from { opacity: 0; } to { opacity: 1; } }

.event-icon {
  width: 38px;
  height: 38px;
  border-radius: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.event-icon.tone-sky { background: rgba(56, 189, 248, 0.16); color: #0284c7; }
.event-icon.tone-amber { background: rgba(245, 158, 11, 0.16); color: #d97706; }
.event-icon.tone-mint { background: rgba(16, 185, 129, 0.16); color: #059669; }
.event-icon.tone-violet { background: rgba(124, 58, 237, 0.14); color: #7c3aed; }

.event-details { flex: 1; min-width: 0; }
.event-title-line { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.event-title-line strong { font-size: 13px; font-weight: 700; color: var(--ink); }

.event-tag { font-size: 10.5px; font-weight: 700; padding: 1px 7px; border-radius: 6px; }
.event-tag.tone-sky { background: rgba(56, 189, 248, 0.18); color: #0369a1; }
.event-tag.tone-amber { background: rgba(245, 158, 11, 0.18); color: #b45309; }
.event-tag.tone-mint { background: rgba(16, 185, 129, 0.18); color: #047857; }
.event-tag.tone-violet { background: rgba(124, 58, 237, 0.14); color: #6d28d9; }

.event-target {
  display: block;
  font-size: 12px;
  color: #64748b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 2px;
}

.event-amount-col { text-align: right; flex-shrink: 0; }
.event-amount-col strong { display: block; font-size: 13.5px; font-weight: 800; color: var(--ink); font-variant-numeric: tabular-nums; }
.event-amount-col span { font-size: 11px; color: #64748b; font-variant-numeric: tabular-nums; }

.empty-state {
  padding: 40px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: var(--navy-2);
  gap: 8px;
}
.empty-state strong { color: var(--ink); font-size: 15px; }
.empty-state p { font-size: 13px; color: var(--text); max-width: 300px; margin: 0; line-height: 1.55; }

/* ---------- SECTIONS ---------- */

.an-section { background: var(--bg); padding: 80px 24px 90px; }
.an-section.grey { background: var(--bg-grey); }

.section-head { text-align: center; margin-bottom: 44px; }

.section-title {
  font-size: clamp(28px, 4vw, 40px);
  font-weight: 800;
  letter-spacing: -1.2px;
  color: var(--ink);
  margin: 0 0 12px;
}

.section-subtitle {
  font-size: 17px;
  line-height: 1.65;
  color: var(--text);
  max-width: 620px;
  margin: 0 auto;
}

.tone-icon {
  width: 46px;
  height: 46px;
  border-radius: 13px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  background: var(--navy);
  flex-shrink: 0;
}

/* ---------- KPI CARDS ---------- */

.kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }

.kpi-card {
  display: flex;
  flex-direction: column;
  padding: 24px;
  border-radius: 20px;
  background: var(--card);
  border: 1px solid var(--card-border);
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
}

.kpi-card:hover {
  transform: translateY(-5px);
  border-color: var(--hero-card);
  box-shadow: 0 0 0 1px var(--hero-card), 0 14px 30px rgba(23, 37, 84, 0.3);
}

.kpi-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
.kpi-title { font-size: 15px; font-weight: 600; color: var(--text); }

.kpi-value {
  font-size: 34px;
  font-weight: 800;
  letter-spacing: -1px;
  color: var(--navy);
  margin: 4px 0 6px;
  font-variant-numeric: tabular-nums;
}

.kpi-sub-text { font-size: 13px; color: var(--text); }

/* ---------- SPLIT PANELS ---------- */

.split-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 22px; }

.panel {
  background: var(--card);
  border: 1px solid var(--card-border);
  border-radius: 20px;
  overflow: hidden;
}

.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 22px 24px 16px;
  border-bottom: 1px solid var(--card-border);
}

.panel-h3 { font-size: 20px; font-weight: 700; letter-spacing: -0.3px; color: var(--navy); margin: 0; }
.panel-sub { font-size: 13.5px; color: var(--text); margin: 3px 0 0; }

.header-pill {
  font-size: 12px;
  font-weight: 700;
  padding: 4px 11px;
  border-radius: 20px;
  color: var(--navy);
  background: #fff;
  border: 1px solid var(--card-border);
  white-space: nowrap;
}

.donut-layout { display: flex; align-items: center; padding: 22px 24px; gap: 24px; }

.donut-box { width: 190px; height: 190px; position: relative; flex-shrink: 0; }

.donut-center {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}
.donut-center strong { font-size: 30px; font-weight: 800; color: var(--navy); font-variant-numeric: tabular-nums; }
.donut-center span { font-size: 12px; font-weight: 600; color: var(--text); }

.status-legend-list { flex: 1; display: flex; flex-direction: column; gap: 13px; min-width: 0; }
.status-legend-item { display: flex; flex-direction: column; gap: 5px; }
.legend-row-top { display: flex; align-items: center; gap: 8px; font-size: 14px; }
.status-swatch { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.legend-title { color: var(--navy); flex: 1; font-weight: 500; }
.legend-count { color: var(--ink); font-variant-numeric: tabular-nums; }
.legend-pct { font-size: 12px; color: var(--text); width: 34px; text-align: right; font-variant-numeric: tabular-nums; }
.legend-track { height: 6px; border-radius: 6px; background: #cfe0fa; overflow: hidden; }
.legend-bar { height: 100%; border-radius: 6px; transition: width 0.4s ease; }

.products-chart-box { height: 250px; padding: 14px 18px; }

/* ---------- ORDERS ---------- */

.orders-panel { background: #fff; }

.orders-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  padding: 20px 24px 14px;
}
.orders-count { margin: 0; }

.orders-search-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 14px;
  height: 42px;
  border-radius: 12px;
  background: #fff;
  border: 1px solid #bcd3f8;
  color: var(--blue);
  min-width: 320px;
}
.orders-search-wrapper:focus-within { border-color: var(--blue); box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15); }

.orders-search-input {
  background: transparent;
  border: none;
  outline: none;
  color: var(--ink);
  font: inherit;
  font-size: 14px;
  flex: 1;
  min-width: 0;
}
.orders-search-input::placeholder { color: #94a3b8; }

.btn-clear-search { background: transparent; border: none; color: #64748b; cursor: pointer; padding: 2px; display: flex; }
.btn-clear-search:hover { color: var(--ink); }

.status-chips-bar {
  display: flex;
  gap: 8px;
  padding: 4px 24px 16px;
  border-bottom: 1px solid var(--line);
  overflow-x: auto;
}

.filter-chip {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 6px 14px;
  border-radius: 20px;
  border: 1px solid var(--card-border);
  background: var(--bg-soft);
  color: var(--navy);
  font: inherit;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}
.filter-chip:hover { background: var(--card); border-color: var(--card-border-hover); }

.chip-count {
  font-size: 11.5px;
  padding: 1px 7px;
  border-radius: 12px;
  background: #fff;
  border: 1px solid var(--card-border);
  font-variant-numeric: tabular-nums;
}

.filter-chip.active { background: var(--navy); border-color: var(--navy); color: #fff; }
.filter-chip.active .chip-count { background: rgba(255, 255, 255, 0.16); border-color: transparent; color: #fff; }

.orders-table-scroll { overflow-x: auto; }

.orders-table { width: 100%; border-collapse: collapse; text-align: left; }

.orders-table th {
  padding: 13px 24px;
  font-size: 12.5px;
  font-weight: 700;
  color: var(--navy);
  background: var(--bg-soft);
  border-bottom: 1px solid var(--line);
  white-space: nowrap;
}

.orders-table td {
  padding: 15px 24px;
  font-size: 14px;
  color: var(--text);
  border-bottom: 1px solid var(--line);
  transition: background 0.15s;
}

.orders-table tbody tr:hover td { background: var(--bg-soft); }

.table-id-cell { display: flex; align-items: center; gap: 8px; color: var(--blue); }
.order-id-text { font-weight: 700; color: var(--ink); font-variant-numeric: tabular-nums; }
.table-customer-cell { display: flex; align-items: center; gap: 10px; }

.customer-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--navy);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 800;
  color: #fff;
  flex-shrink: 0;
}

.customer-name-text { font-weight: 600; color: var(--ink); }
.customer-email-text { color: var(--text); font-size: 13.5px; }
.th-right { text-align: right !important; }
.order-amount-text { color: var(--ink); font-size: 14.5px; font-variant-numeric: tabular-nums; }

.order-status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 11px;
  border-radius: 20px;
  font-size: 12.5px;
  font-weight: 700;
  text-transform: capitalize;
  background: #fff;
  border: 1px solid var(--card-border);
  color: var(--navy);
}
.badge-dot { width: 6px; height: 6px; border-radius: 50%; background: #94a3b8; }

.order-status-badge.delivered { background: rgba(16, 185, 129, 0.12); border-color: rgba(16, 185, 129, 0.3); color: #047857; }
.order-status-badge.delivered .badge-dot { background: #10b981; }
.order-status-badge.processing { background: rgba(245, 158, 11, 0.12); border-color: rgba(245, 158, 11, 0.35); color: #b45309; }
.order-status-badge.processing .badge-dot { background: #f59e0b; }
.order-status-badge.pending { background: rgba(96, 165, 250, 0.14); border-color: rgba(96, 165, 250, 0.4); color: #1d4ed8; }
.order-status-badge.pending .badge-dot { background: #60a5fa; }
.order-status-badge.cancelled { background: rgba(251, 113, 133, 0.12); border-color: rgba(251, 113, 133, 0.35); color: #be123c; }
.order-status-badge.cancelled .badge-dot { background: #fb7185; }

/* ---------- TOOLTIP & STATE SCREENS ---------- */

.chart-tooltip {
  background: var(--navy);
  border: 1px solid var(--hero-card-border);
  border-radius: 10px;
  padding: 9px 13px;
  box-shadow: 0 10px 26px rgba(15, 26, 46, 0.35);
  font-family: Outfit, Inter, system-ui, sans-serif;
}
.chart-tooltip .tooltip-label { font-size: 12px; color: #c5d3f0; margin-bottom: 2px; }
.chart-tooltip .tooltip-val { font-size: 15px; font-weight: 800; color: #fff; font-variant-numeric: tabular-nums; }

.an-state {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 30px;
  gap: 12px;
  background: var(--bg-soft);
}
.an-state h2 { font-size: 26px; font-weight: 800; letter-spacing: -0.6px; margin: 4px 0 0; color: var(--ink); }
.an-state p { font-size: 16px; color: var(--text); max-width: 440px; margin: 0; line-height: 1.6; }

.state-icon {
  width: 64px;
  height: 64px;
  border-radius: 18px;
  background: var(--navy);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
}
.state-icon.bad { background: #ef4444; }

.btn-primary-action {
  padding: 14px 26px;
  border-radius: 13px;
  background: var(--deep-blue);
  color: #fff;
  border: none;
  font: inherit;
  font-weight: 700;
  font-size: 15.5px;
  cursor: pointer;
  margin-top: 10px;
  transition: transform 0.2s ease, background 0.2s ease;
}
.btn-primary-action:hover { background: var(--navy-2); transform: translateY(-2px); }

/* ---------- SKELETON ---------- */

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
  border-radius: 18px;
  background: linear-gradient(90deg, #e6eefc 25%, #f3f7ff 50%, #e6eefc 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
}

.sk-title { height: 44px; width: 320px; max-width: 100%; }
.sk-hero { height: 370px; }
.sk-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
.sk-kpi { height: 135px; }

@keyframes shimmer { to { background-position: -200% 0; } }

/* ---------- FOCUS ---------- */

.nav-user:focus-visible,
.btn-stream-ctrl:focus-visible,
.btn-action-icon:focus-visible,
.hero-accent:focus-visible,
.filter-chip:focus-visible,
.view-tab-btn:focus-visible,
.feed-mini-btn:focus-visible {
  outline: 2px solid #bfdbfe;
  outline-offset: 2px;
}

.filter-chip:focus-visible,
.feed-mini-btn:focus-visible { outline-color: var(--blue); }

/* ---------- RESPONSIVE ---------- */

@media (max-width: 1100px) {
  .hero-grid { grid-template-columns: 1fr; }
  .feed-card { max-height: 420px; }
  .kpi-grid { grid-template-columns: repeat(2, 1fr); }
  .split-grid { grid-template-columns: 1fr; }
}

@media (max-width: 800px) {
  .an-hero { padding: 20px 18px 48px; }
  .an-top-row { margin-bottom: 32px; }
  .an-section { padding: 56px 18px 64px; }
  .hero-desc { font-size: 16.5px; }
  .revenue-card { padding: 20px 18px 10px; }
  .revenue-number { font-size: 34px; }
  .revenue-chart-canvas { height: 230px; }
  .kpi-grid { grid-template-columns: 1fr; }
  .sk-row { grid-template-columns: 1fr 1fr; }
}

@media (max-width: 680px) {
  .an-controls { width: 100%; }
  .live-sync-pill { flex: 1 1 100%; }
  .donut-layout { flex-direction: column; }
  .donut-box { width: 100%; max-width: 220px; }
  .status-legend-list { width: 100%; }
  .orders-search-wrapper { min-width: 0; width: 100%; }
  .th-email { display: none; }
  .orders-table th, .orders-table td { padding: 13px 14px; }
}

@media (prefers-reduced-motion: reduce) {
  .an-page *, .an-page *::before, .an-page *::after,
  .an-state *, .an-state *::before, .an-state *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
`;

export default Analytics;