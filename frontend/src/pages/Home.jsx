import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  ChevronRight,
  CircleDollarSign,
  CreditCard,
  Database,
  Eye,
  Filter,
  Layers,
  Menu,
  Package,
  Radio,
  Search,
  ShoppingCart,
  Sparkles,
  TrendingUp,
  Users,
  X,
  Zap,
} from "lucide-react";

const LIVE_EVENTS = [
  {
    title: "New order #ORD-9214",
    detail: "Payment confirmed",
    amount: "₹2,190",
    icon: CircleDollarSign,
    color: "#10b981",
  },
  {
    title: "Added to cart",
    detail: "Customer in Mumbai · Nike Air Max",
    amount: "₹8,290",
    icon: ShoppingCart,
    color: "#f59e0b",
  },
  {
    title: "Checkout started",
    detail: "Customer in Bengaluru",
    amount: "₹6,750",
    icon: CreditCard,
    color: "#2563eb",
  },
  {
    title: "Product viewed",
    detail: "Minimalist Leather Watch",
    amount: "₹4,150",
    icon: Eye,
    color: "#7c3aed",
  },
];

export default function Home() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeNav, setActiveNav] = useState("home");
  const [eventIdx, setEventIdx] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  const [savedUser] = useState(() => {
    try {
      const u = localStorage.getItem("user");
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setEventIdx((i) => (i + 1) % LIVE_EVENTS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const liveEvent = LIVE_EVENTS[eventIdx];
  const LiveIcon = liveEvent.icon;
  const userInitial = (savedUser?.firstName || "A").charAt(0).toUpperCase();
  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <div className="home-root">
      <style>{homeCss}</style>

      <header className={`home-header${scrolled ? " is-scrolled" : ""}`}>
        <div className="home-nav-container">
          <Link
            to="/"
            className="home-brand"
            onClick={() => setActiveNav("home")}
          >
            <span className="brand-name">
              <span className="brand-shop">Shop</span>
              <span className="brand-lytics">lytics</span>
            </span>
          </Link>

          <nav className="home-nav-links" aria-label="Main navigation">
            <Link
              to="/"
              className={`nav-link${activeNav === "home" ? " active" : ""}`}
              onClick={() => setActiveNav("home")}
            >
              Home
            </Link>
            <Link
              to="/analytics"
              className={`nav-link${activeNav === "analytics" ? " active" : ""}`}
              onClick={() => setActiveNav("analytics")}
            >
              Analytics
            </Link>
            <a
              href="#features"
              className={`nav-link${activeNav === "features" ? " active" : ""}`}
              onClick={() => setActiveNav("features")}
            >
              Features
            </a>
            <a
              href="#how"
              className={`nav-link${activeNav === "how" ? " active" : ""}`}
              onClick={() => setActiveNav("how")}
            >
              How it works
            </a>
          </nav>

          <div className="home-nav-actions">
            {savedUser ? (
              <div className="user-nav-wrap">
                <Link
                  to="/profile"
                  className="nav-user"
                  title="View account profile"
                >
                  <span className="nav-avatar">{userInitial}</span>
                  <span className="nav-user-name">
                    Hello, {savedUser.firstName || "Admin"}{" "}
                    <span className="wave-hand" aria-label="waving hand">
                      👋
                    </span>
                  </span>
                </Link>
                <button
                  className="btn-logout"
                  onClick={() => {
                    localStorage.removeItem("user");
                    navigate("/login");
                  }}
                >
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link to="/login" className="btn-ghost">
                  Log in
                </Link>
                <Link to="/signup" className="btn-secondary-nav">
                  Get started
                </Link>
              </>
            )}

            <button
              className="btn-mobile-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="mobile-menu-drawer">
            <Link
              to="/"
              className={`mobile-nav-link${activeNav === "home" ? " active" : ""}`}
              onClick={() => {
                setActiveNav("home");
                closeMenu();
              }}
            >
              Home
            </Link>
            <Link
              to="/analytics"
              className={`mobile-nav-link${activeNav === "analytics" ? " active" : ""}`}
              onClick={() => {
                setActiveNav("analytics");
                closeMenu();
              }}
            >
              Analytics
            </Link>
            <a
              href="#features"
              className={`mobile-nav-link${activeNav === "features" ? " active" : ""}`}
              onClick={() => {
                setActiveNav("features");
                closeMenu();
              }}
            >
              Features
            </a>
            <a
              href="#how"
              className={`mobile-nav-link${activeNav === "how" ? " active" : ""}`}
              onClick={() => {
                setActiveNav("how");
                closeMenu();
              }}
            >
              How it works
            </a>

            {savedUser ? (
              <div className="mobile-actions-row">
                <Link
                  to="/profile"
                  className="btn-mobile-auth"
                  onClick={closeMenu}
                >
                  My profile
                </Link>
                <Link
                  to="/analytics"
                  className="btn-mobile-auth primary"
                  onClick={closeMenu}
                >
                  Open Analytics
                </Link>
              </div>
            ) : (
              <div className="mobile-actions-row">
                <Link
                  to="/login"
                  className="btn-mobile-auth"
                  onClick={closeMenu}
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  className="btn-mobile-auth primary"
                  onClick={closeMenu}
                >
                  Get started
                </Link>
              </div>
            )}
          </div>
        )}
      </header>

      <section className="home-hero">
        <div className="home-hero-container">
          <div className="hero-copy">
            <h1 className="hero-title">
              Know what's happening in your store,{" "}
              <span className="hero-accent">as it happens.</span>
            </h1>

            <p className="hero-desc">
              Shoplytics brings your orders, revenue and customer activity
              into one live dashboard, so you can spot trends early and act
              on them quickly.
            </p>

            <div className="hero-cta-group">
              <button
                className="btn-hero-primary"
                onClick={() => navigate("/analytics")}
              >
                <span>See Analytics</span>
              </button>

              <a href="#features" className="btn-hero-secondary">
                <span>Explore features</span>
              </a>

              {!savedUser && (
                <Link to="/signup" className="btn-hero-ghost">
                  <span>Create free account</span>
                  <ChevronRight size={16} />
                </Link>
              )}
            </div>

            <div className="hero-points">
              <span><h2>Revenue &amp; sales</h2></span>
              <span><h2>Orders &amp; status</h2></span>
              <span><h2>Customer activity</h2></span>
              <span><h2>Top products</h2></span>
            </div>
          </div>

          <div className="hero-visual" aria-hidden="true">
            <div className="hv-main">
              <div className="hv-head">
                <span className="hv-title">Revenue today</span>
                <span className="hv-chip">SAMPLE DATA</span>
              </div>

              <div className="hv-revenue">
                <span className="hv-amount">₹2,48,900</span>
                <span className="hv-trend">
                  <TrendingUp size={13} /> +18.4%
                </span>
              </div>

              <svg
                viewBox="0 0 400 130"
                className="hv-chart"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient
                    id="heroChartGrad"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#bfdbfe" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#bfdbfe" stopOpacity="0" />
                  </linearGradient>
                </defs>

                {[30, 65, 100].map((y) => (
                  <line
                    key={y}
                    x1="0"
                    y1={y}
                    x2="400"
                    y2={y}
                    stroke="rgba(255,255,255,0.14)"
                    strokeDasharray="4 4"
                  />
                ))}

                <path
                  d="M0,100 C40,95 70,70 110,78 C150,86 180,40 230,48 C280,56 310,20 350,26 C375,30 390,16 396,12 L396,130 L0,130 Z"
                  fill="url(#heroChartGrad)"
                />
                <path
                  d="M0,100 C40,95 70,70 110,78 C150,86 180,40 230,48 C280,56 310,20 350,26 C375,30 390,16 396,12"
                  fill="none"
                  stroke="#bfdbfe"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <circle
                  cx="230"
                  cy="48"
                  r="4.5"
                  fill="#bfdbfe"
                  stroke="#1e40af"
                  strokeWidth="2"
                />
                <circle
                  cx="396"
                  cy="12"
                  r="5.5"
                  fill="#bfdbfe"
                  stroke="#1e40af"
                  strokeWidth="2"
                />
              </svg>

              <div className="hv-axis">
                <span>10 AM</span>
                <span>12 PM</span>
                <span>2 PM</span>
                <span>4 PM</span>
                <span>Now</span>
              </div>

              <div className="hv-stats">
                <div className="hv-stat">
                  <div className="hv-stat-val">846</div>
                  <div className="hv-stat-label">Orders</div>
                </div>
                <div className="hv-stat">
                  <div className="hv-stat-val">1,429</div>
                  <div className="hv-stat-label">Shoppers</div>
                </div>
                <div className="hv-stat">
                  <div className="hv-stat-val">4.82%</div>
                  <div className="hv-stat-label">Conversion</div>
                </div>
              </div>
            </div>

            <div className="hv-float hv-status">
              <svg viewBox="0 0 64 64" className="hv-donut">
                <g
                  transform="rotate(-90 32 32)"
                  fill="none"
                  strokeWidth="9"
                >
                  <circle cx="32" cy="32" r="26" stroke="#e5ecf8" />
                  <circle
                    cx="32"
                    cy="32"
                    r="26"
                    stroke="#10b981"
                    strokeDasharray="101.3 163.4"
                    strokeDashoffset="0"
                  />
                  <circle
                    cx="32"
                    cy="32"
                    r="26"
                    stroke="#f59e0b"
                    strokeDasharray="39.2 163.4"
                    strokeDashoffset="-101.3"
                  />
                  <circle
                    cx="32"
                    cy="32"
                    r="26"
                    stroke="#93c5fd"
                    strokeDasharray="22.9 163.4"
                    strokeDashoffset="-140.5"
                  />
                </g>
              </svg>
              <div>
                <div className="hv-donut-title">Order status</div>
                <div className="hv-legend">
                  <span style={{ "--d": "#10b981" }}><i /> Delivered</span>
                  <span style={{ "--d": "#f59e0b" }}><i /> Processing</span>
                  <span style={{ "--d": "#93c5fd" }}><i /> Pending</span>
                </div>
              </div>
            </div>

            <div className="hv-float hv-toast" key={eventIdx}>
              <span
                className="hv-toast-icon"
                style={{
                  backgroundColor: `${liveEvent.color}1f`,
                  color: liveEvent.color,
                }}
              >
                <LiveIcon size={18} />
              </span>
              <div className="hv-toast-body">
                <div className="hv-live">LIVE</div>
                <div className="hv-toast-title">{liveEvent.title}</div>
                <div className="hv-toast-detail">{liveEvent.detail}</div>
              </div>
              <span className="hv-toast-amount">{liveEvent.amount}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="home-features-section" id="features">
        <div className="features-container">
          <div className="section-head text-center">
            <h2 className="section-title">
              Everything your store needs to see
            </h2>
            <p className="section-subtitle">
              From the first product view to the final payment, every step
              of the customer journey is tracked and shown in one place.
            </p>
          </div>

          <div className="bento-grid">
            <article className="fcard">
              <span className="tone-icon big">
                <CircleDollarSign size={24} />
              </span>
              <h3 className="feature-title">Sales &amp; revenue</h3>
              <p className="feature-text">
                Watch total revenue, order value and growth compared to the
                previous period, updated the moment a sale comes in.
              </p>
              <div className="mini-bars" aria-hidden="true">
                {[38, 52, 44, 66, 58, 80, 72, 94].map((h, i) => (
                  <span
                    key={i}
                    style={{ height: `${h}%` }}
                    className={i === 7 ? "bar-last" : ""}
                  />
                ))}
              </div>
            </article>

            <article className="fcard">
              <span className="tone-icon big">
                <ShoppingCart size={24} />
              </span>
              <h3 className="feature-title">Order tracking</h3>
              <p className="feature-text">
                See every order and where it stands, from pending to
                delivered.
              </p>
              <div className="mini-pills" aria-hidden="true">
                <span style={{ "--p": "#10b981" }}>Delivered</span>
                <span style={{ "--p": "#f59e0b" }}>Processing</span>
                <span style={{ "--p": "#60a5fa" }}>Pending</span>
                <span style={{ "--p": "#fb7185" }}>Cancelled</span>
              </div>
            </article>

            <article className="fcard">
              <span className="tone-icon big">
                <Users size={24} />
              </span>
              <h3 className="feature-title">Customer activity</h3>
              <p className="feature-text">
                A live feed of searches, views, cart adds and checkouts as
                shoppers move through your store.
              </p>
              <div className="mini-feed" aria-hidden="true">
                <span><i /> Viewed a product</span>
                <span><i /> Added to cart</span>
                <span><i /> Started checkout</span>
              </div>
            </article>

            <article className="fcard">
              <span className="tone-icon big">
                <Package size={24} />
              </span>
              <h3 className="feature-title">Top products</h3>
              <p className="feature-text">
                Know instantly which products sell the most and bring in the
                most revenue, so you can restock and promote the right ones.
              </p>
              <div className="mini-rank" aria-hidden="true">
                {[
                  ["Wireless Headphones", 92],
                  ["Running Shoes", 74],
                  ["Leather Watch", 58],
                ].map(([name, w]) => (
                  <div key={name} className="rank-row">
                    <span>{name}</span>
                    <div className="rank-track">
                      <div style={{ width: `${w}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </article>

            <article className="fcard">
              <span className="tone-icon big">
                <Search size={24} />
              </span>
              <h3 className="feature-title">Instant search &amp; filters</h3>
              <p className="feature-text">
                Find any order by ID, customer name or email, and narrow
                results with quick status filters.
              </p>
              <div className="mini-search" aria-hidden="true">
                <Search size={15} />
                <span>ORD-8492</span>
              </div>
            </article>

            <article className="fcard">
              <span className="tone-icon big">
                <Filter size={24} />
              </span>
              <h3 className="feature-title">Checkout funnel</h3>
              <p className="feature-text">
                See where shoppers drop off between viewing a product and
                paying for it.
              </p>
              <div className="mini-funnel" aria-hidden="true">
                {[
                  ["Viewed", 100],
                  ["Added to cart", 62],
                  ["Checkout", 38],
                  ["Paid", 24],
                ].map(([label, w]) => (
                  <div key={label} className="funnel-row">
                    <div style={{ width: `${w}%` }}>{label}</div>
                  </div>
                ))}
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="home-how-section" id="how">
        <div className="how-container">
          <div className="section-head text-center">
            <h2 className="section-title">From a click to your dashboard</h2>
            <p className="section-subtitle">
              Shoplytics picks up what happens in your store and shows it on
              your screen right away.
            </p>
          </div>

          <div className="steps-grid">
            <div className="step-card">
              <div className="step-top">
                <span className="tone-icon"><Users size={20} /></span>
                <span className="step-num">1</span>
              </div>
              <h4 className="step-title">Shoppers act</h4>
              <p className="step-text">
                Customers search, browse, add to cart and check out on your
                store.
              </p>
            </div>

            <div className="step-card">
              <div className="step-top">
                <span className="tone-icon"><Database size={20} /></span>
                <span className="step-num">2</span>
              </div>
              <h4 className="step-title">Events are saved</h4>
              <p className="step-text">
                The Express API receives each event and stores it in MongoDB.
              </p>
            </div>

            <div className="step-card">
              <div className="step-top">
                <span className="tone-icon"><Radio size={20} /></span>
                <span className="step-num">3</span>
              </div>
              <h4 className="step-title">Updates are pushed</h4>
              <p className="step-text">
                Socket.IO sends the new data straight to your open dashboard,
                with no refresh needed.
              </p>
            </div>

            <div className="step-card">
              <div className="step-top">
                <span className="tone-icon"><BarChart3 size={20} /></span>
                <span className="step-num">4</span>
              </div>
              <h4 className="step-title">You see it live</h4>
              <p className="step-text">
                Numbers, charts and the activity feed update instantly on
                your screen.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="home-cta-banner">
        <div className="cta-banner-container">
          <h2 className="cta-title">
            Turn live store activity into clear decisions.
          </h2>
          <p className="cta-desc">
            Follow sales, orders and customer behaviour as they happen.
            Open your dashboard now, or create a free account to get
            started in minutes.
          </p>
          <div className="cta-btn-group">
            {!savedUser && (
              <Link to="/signup" className="btn-cta-signup">
                <span>Create free account</span>
                <ChevronRight size={16} />
              </Link>
            )}
          </div>
        </div>
      </section>

      <footer className="home-footer">
        <div className="footer-container">
          <div className="footer-top-row">
            <div className="footer-brand-side">
              <div className="footer-logo">
                <span className="brand-name">Shoplytics</span>
              </div>
              <p className="footer-tagline">
                Live sales, order and customer analytics for online stores.
              </p>
            </div>

            <div className="footer-nav-groups">
              <div className="footer-col">
                <span className="footer-col-title">Explore</span>
                <Link to="/" className="footer-link">Home</Link>
                <Link to="/analytics" className="footer-link">Analytics</Link>
                <a href="#features" className="footer-link">Features</a>
              </div>

              <div className="footer-col">
                <span className="footer-col-title">Account</span>
                <Link to="/login" className="footer-link">Log In</Link>
                <Link to="/signup" className="footer-link">Sign Up</Link>
              </div>

              <div className="footer-col">
                <span className="footer-col-title">Built with</span>
                <span className="footer-text-tech">React</span>
                <span className="footer-text-tech">Socket.IO</span>
                <span className="footer-text-tech">Node.js &amp; Express</span>
                <span className="footer-text-tech">MongoDB</span>
              </div>
            </div>
          </div>

          <div className="footer-bottom-row">
            <span>
              &copy; {new Date().getFullYear()} Shoplytics. All rights reserved.
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

const homeCss = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');

.home-root {
  --navy: #0f1a2e;
  --royal: #1f4fd8;
  --navy-2: #1e3a8a;
  --blue: #2563eb;
  --blue-deep: #1d4ed8;
  --blue-soft: #93c5fd;
  --card: #eaf2ff;
  --card-hover: #dce9fd;
  --card-border: #d0e1fb;
  --card-border-hover: #93b8f3;
  --ink: #0b1220;
  --text: #475569;
  --line: #e2e8f0;
  --bg: #ffffff;
  --bg-soft: #f6f9ff;
  --bg-grey: #f1f3f6;
  --black: #0a0a0c;
  --black-glass: rgba(10, 10, 12, 0.55);
  --deep-blue: #111827;
  --hero-card: #172554;
  --hero-card-border: #2c4390;
  min-height: 100vh;
  background: var(--bg);
  color: var(--ink);
  overflow-x: clip;
  position: relative;
  font-family: Outfit, Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.home-root * { box-sizing: border-box; }
.home-root html { scroll-behavior: smooth; }

.tone-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  background: var(--navy);
  flex-shrink: 0;
  transition: background 0.25s ease, color 0.25s ease;
}

.feature-title, .feature-text, .step-title, .step-text {
  transition: color 0.25s ease;
}

.tone-icon.big {
  width: 50px;
  height: 50px;
  border-radius: 14px;
  margin-bottom: 20px;
}

.home-header {
  position: sticky;
  top: 0;
  width: 100%;
  z-index: 100;
  background: var(--black);
  border-bottom: 1px solid transparent;
  transition: background 0.3s ease, backdrop-filter 0.3s ease, border-color 0.3s ease;
}

.home-header.is-scrolled {
  background: var(--black-glass);
  -webkit-backdrop-filter: saturate(160%) blur(16px);
  backdrop-filter: saturate(160%) blur(16px);
  border-bottom-color: rgba(255, 255, 255, 0.08);
}

.home-nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  height: 68px;
  display: grid;
  grid-template-columns: minmax(230px, 1fr) auto minmax(220px, 1fr);
  align-items: center;
  gap: 28px;
}

.home-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: inherit;
  justify-self: start;
  white-space: nowrap;
}

.brand-name {
  font-size: 25px;
  font-weight: 900;
  letter-spacing: -0.8px;
  color: #fff;
}

.brand-shop { color: #ffffff; }
.brand-lytics { color: #bfdbfe; }

.brand-tagline {
  color: #bfdbfe;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.15px;
  padding-left: 10px;
  border-left: 1px solid rgba(191, 219, 254, 0.45);
}

.btn-logout {
  border: 1px solid #ef4444;
  border-radius: 10px;
  padding: 9px 16px;
  background: #ef4444;
  color: #ffffff;
  font: inherit;
  font-size: 14px;
  font-weight: 750;
  cursor: pointer;
  transition: all 0.25s ease;
}

.btn-logout:hover {
  background: #dc2626;
  border-color: #dc2626;
  color: #ffffff;
  transform: translateY(-2px);
  box-shadow: 0 5px 14px rgba(239, 68, 68, 0.3);
}

.btn-logout:active {
  transform: translateY(0);
  box-shadow: none;
}


.home-nav-links {
  display: flex;
  align-items: center;
  gap: 8px;
}

.nav-link {
  position: relative;
  display: flex;
  align-items: center;
  height: 68px;
  padding: 0 15px;
  font-size: 16.5px;
  font-weight: 750;
  color: rgba(255, 255, 255, 0.78);
  text-decoration: none;
  transition: color 0.2s ease;
}

.nav-link:hover { color: #fff; }

.nav-link.active {
  color: #fff;
  font-weight: 900;
}

.nav-link.active::after {
  content: "";
  position: absolute;
  left: 15px;
  right: 15px;
  bottom: 0;
  height: 3px;
  border-radius: 2px;
  background: #bfdbfe;
}

.home-nav-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  justify-self: end;
}

.user-nav-wrap { display: flex; align-items: center; gap: 12px; }

.nav-user {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 5px 12px 5px 5px;
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

.wave-hand {
  display: inline-block;
  transform-origin: 70% 70%;
  animation: navWave 1.8s ease-in-out infinite;
}

@keyframes navWave {
  0%, 60%, 100% { transform: rotate(0deg); }
  10%, 30% { transform: rotate(14deg); }
  20%, 40% { transform: rotate(-8deg); }
}

.btn-ghost {
  font-size: 14.5px;
  font-weight: 600;
  color: #fff;
  text-decoration: none;
  padding: 9px 16px;
  border-radius: 10px;
  transition: all 0.2s;
}

.btn-ghost:hover { background: rgba(255, 255, 255, 0.14); }

.btn-secondary-nav {
  font-size: 14.5px;
  font-weight: 700;
  color: var(--black);
  text-decoration: none;
  padding: 9px 18px;
  border-radius: 10px;
  background: #fff;
  transition: background 0.2s;
}

.btn-secondary-nav:hover { background: #e5e7eb; }

.btn-mobile-toggle {
  display: none;
  background: transparent;
  border: none;
  color: #fff;
  cursor: pointer;
  padding: 6px;
}

.mobile-menu-drawer {
  padding: 10px 20px 18px;
  display: flex;
  flex-direction: column;
  background: transparent;
  border-top: 1px solid rgba(255, 255, 255, 0.12);
}

.mobile-nav-link {
  padding: 14px 4px;
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  font-size: 16px;
  font-weight: 500;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
}

.mobile-nav-link.active { color: #fff; font-weight: 700; }

.mobile-actions-row { display: flex; gap: 10px; margin-top: 16px; }

.btn-mobile-auth {
  flex: 1;
  text-align: center;
  padding: 12px;
  border-radius: 10px;
  font-size: 14.5px;
  font-weight: 700;
  color: #fff;
  background: rgba(255, 255, 255, 0.12);
  text-decoration: none;
}

.btn-mobile-auth.primary { background: #fff; color: var(--black); }

.home-hero {
  background: var(--deep-blue);
  padding: 76px 24px 90px;
}

.home-hero-container {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1.02fr 0.98fr;
  gap: 56px;
  align-items: center;
}

.hero-copy { text-align: left; }

.hero-title {
  font-size: clamp(36px, 4.4vw, 58px);
  font-weight: 800;
  line-height: 1.08;
  letter-spacing: -1.8px;
  color: #fff;
  margin: 0 0 22px;
  max-width: 620px;
}

.hero-accent { color: #bfdbfe; }

.hero-desc {
  font-size: 18px;
  line-height: 1.65;
  color: #dbe6ff;
  max-width: 540px;
  margin: 0 0 34px;
}

.hero-cta-group {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 14px;
  margin-bottom: 38px;
}

.btn-hero-primary {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 15px 26px;
  border-radius: 13px;
  font-family: inherit;
  font-size: 16px;
  font-weight: 700;
  color: var(--deep-blue);
  background: #fff;
  border: none;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.2s ease;
}

.btn-hero-primary:hover { background: #eaf2ff; transform: translateY(-2px); }

.btn-hero-secondary {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 15px 24px;
  border-radius: 13px;
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.22);
  text-decoration: none;
  transition: background 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
}

.btn-hero-secondary:hover {
  background: rgba(255, 255, 255, 0.16);
  border-color: rgba(255, 255, 255, 0.38);
  transform: translateY(-2px);
}

.btn-hero-ghost {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 15px;
  font-weight: 600;
  color: #fff;
  text-decoration: none;
  padding: 12px 8px;
  transition: color 0.2s;
}

.btn-hero-ghost:hover { color: #bfdbfe; }

.hero-points {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 24px;
  font-size: 14px;
  color: #dbe6ff;
}

.hero-points span { display: inline-flex; align-items: center; gap: 8px; }

.section-head { margin-bottom: 48px; }
.section-head.text-center { text-align: center; }

.section-title {
  font-size: clamp(30px, 4vw, 42px);
  font-weight: 800;
  letter-spacing: -1.3px;
  color: var(--ink);
  margin: 0 0 14px;
}

.section-subtitle {
  font-size: 17px;
  line-height: 1.65;
  color: var(--text);
  max-width: 620px;
  margin: 0 auto;
}

.hero-visual {
  position: relative;
  padding: 26px 22px 34px 30px;
}

.hv-main {
  position: relative;
  padding: 22px;
  border-radius: 22px;
  background: var(--hero-card);
  border: 1px solid var(--hero-card-border);
}

.hv-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.hv-title { font-size: 14px; font-weight: 600; color: #c5d3f0; }

.hv-chip {
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.6px;
  padding: 4px 10px;
  border-radius: 20px;
  color: var(--blue-soft);
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.18);
}

.hv-revenue { display: flex; align-items: baseline; gap: 12px; flex-wrap: wrap; }

.hv-amount {
  font-size: 36px;
  font-weight: 800;
  letter-spacing: -1.2px;
  color: #fff;
  font-variant-numeric: tabular-nums;
}

.hv-trend {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 12.5px;
  font-weight: 700;
  padding: 3px 9px;
  border-radius: 14px;
  color: #34d399;
  background: rgba(16, 185, 129, 0.18);
}

.hv-chart { width: 100%; height: 140px; margin: 14px 0 6px; overflow: visible; }

.hv-axis {
  display: flex;
  justify-content: space-between;
  font-size: 11.5px;
  color: #a9b8dc;
  margin-bottom: 18px;
}

.hv-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }

.hv-stat {
  padding: 12px 13px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.14);
}

.hv-stat-val { font-size: 19px; font-weight: 800; letter-spacing: -0.4px; color: #fff; font-variant-numeric: tabular-nums; }
.hv-stat-label { font-size: 12px; color: var(--blue-soft); margin-top: 2px; font-weight: 500; }

.hv-float {
  position: absolute;
  z-index: 3;
  border-radius: 16px;
  background: #fff;
  border: 1px solid var(--card-border);
  box-shadow: 0 8px 22px rgba(15, 26, 46, 0.1);
}

.hv-status {
  top: -4px;
  right: -6px;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
}

.hv-donut { width: 62px; height: 62px; flex-shrink: 0; }
.hv-donut-title { font-size: 12.5px; font-weight: 700; color: var(--ink); margin-bottom: 6px; }
.hv-legend { display: flex; flex-direction: column; gap: 4px; font-size: 11.5px; color: var(--text); }
.hv-legend span { display: flex; align-items: center; gap: 7px; }
.hv-legend i { width: 7px; height: 7px; border-radius: 50%; background: var(--d); }

.hv-toast {
  left: -6px;
  bottom: -4px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 13px 16px;
  min-width: 270px;
  animation: homeToast 0.45s ease both;
}

.hv-toast-icon {
  width: 38px;
  height: 38px;
  border-radius: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.hv-toast-body { flex: 1; min-width: 0; }
.hv-toast-title { font-size: 13px; font-weight: 700; color: var(--ink); }
.hv-toast-detail { font-size: 11.5px; color: #64748b; margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.hv-toast-amount { font-size: 14px; font-weight: 800; color: var(--ink); font-variant-numeric: tabular-nums; }

.hv-live {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 9.5px;
  font-weight: 800;
  letter-spacing: 0.7px;
  color: #059669;
  margin-bottom: 3px;
}

.hv-live::before {
  content: "";
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #10b981;
}

@keyframes homeToast {
  from { opacity: 0; }
  to { opacity: 1; }
}

.home-features-section {
  background: var(--bg);
  padding: 80px 24px 90px;
}

.features-container { max-width: 1200px; margin: 0 auto; }

.bento-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.fcard {
  display: flex;
  flex-direction: column;
  min-height: 340px;
  padding: 28px;
  border-radius: 20px;
  background: var(--card);
  border: 1px solid var(--card-border);
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
}

.fcard:hover {
  transform: translateY(-5px);
  border-color: var(--hero-card);
  box-shadow: 0 0 0 1px var(--hero-card), 0 14px 30px rgba(23, 37, 84, 0.3);
}

.feature-title {
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.4px;
  color: var(--navy);
  margin: 0 0 10px;
}

.feature-text {
  font-size: 15px;
  line-height: 1.65;
  color: var(--text);
  margin: 0 0 24px;
  max-width: 480px;
}

.mini-bars {
  margin-top: auto;
  height: 76px;
  display: flex;
  align-items: flex-end;
  gap: 8px;
  max-width: 420px;
}

.mini-bars span {
  flex: 1;
  border-radius: 6px 6px 3px 3px;
  background: #b9d2f9;
}

.mini-bars .bar-last { background: var(--navy-2); }

.mini-pills { margin-top: auto; display: flex; flex-wrap: wrap; gap: 8px; }

.mini-pills span {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 12px;
  font-weight: 600;
  padding: 5px 11px;
  border-radius: 20px;
  color: var(--navy);
  background: #fff;
  border: 1px solid var(--card-border);
}

.mini-pills span::before {
  content: "";
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--p);
}

.mini-feed { margin-top: auto; display: flex; flex-direction: column; gap: 8px; }

.mini-feed span {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12.5px;
  color: var(--navy);
  padding: 8px 12px;
  border-radius: 10px;
  background: #fff;
  border: 1px solid var(--card-border);
}

.mini-feed i {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--blue);
}

.mini-rank { margin-top: auto; display: flex; flex-direction: column; gap: 11px; max-width: 460px; }
.rank-row { display: flex; align-items: center; gap: 14px; font-size: 13px; color: var(--navy); }
.rank-row span { width: 120px; flex-shrink: 0; }
.rank-track { flex: 1; height: 8px; border-radius: 8px; background: #cfe0fa; overflow: hidden; }
.rank-track div { height: 100%; border-radius: 8px; background: var(--navy-2); }

.mini-search {
  margin-top: auto;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border-radius: 12px;
  font-size: 13.5px;
  color: var(--navy);
  background: #fff;
  border: 1px solid #bcd3f8;
  max-width: 320px;
}

.mini-search svg { color: var(--blue); }

.mini-funnel { margin-top: auto; display: flex; flex-direction: column; gap: 7px; }

.funnel-row div {
  padding: 7px 12px;
  font-size: 12px;
  font-weight: 600;
  color: #fff;
  white-space: nowrap;
  border-radius: 8px;
  background: var(--navy-2);
}

.home-how-section {
  background: var(--bg-grey);
  padding: 80px 24px 90px;
}

.how-container { max-width: 1200px; margin: 0 auto; }

.steps-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px; }

.step-card {
  min-height: 190px;
  padding: 24px 22px;
  border-radius: 18px;
  background: var(--card);
  border: 1px solid var(--card-border);
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
}

.step-card:hover {
  transform: translateY(-5px);
  border-color: var(--hero-card);
  box-shadow: 0 0 0 1px var(--hero-card), 0 14px 30px rgba(23, 37, 84, 0.3);
}

.step-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; }

.step-num {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 800;
  color: var(--navy);
  background: #fff;
  border: 1px solid var(--card-border-hover);
}

.step-title { font-size: 18px; font-weight: 700; color: var(--navy); margin: 0 0 8px; }
.step-text { font-size: 14px; line-height: 1.6; color: var(--text); margin: 0; }

.home-cta-banner { background: var(--deep-blue); padding: 80px 24px 90px; }

.cta-banner-container {
  max-width: 1100px;
  margin: 0 auto;
  border-radius: 24px;
  background: var(--hero-card);
  border: 1px solid var(--hero-card-border);
  padding: 64px 40px;
  text-align: center;
}

.cta-title {
  font-size: clamp(30px, 4vw, 42px);
  font-weight: 800;
  letter-spacing: -1.3px;
  color: #fff;
  margin: 0 auto 16px;
  max-width: 680px;
}

.cta-desc { font-size: 17px; line-height: 1.65; color: #c5d3f0; margin: 0 auto 34px; max-width: 600px; }

.cta-btn-group { display: flex; align-items: center; justify-content: center; gap: 14px; flex-wrap: wrap; }

.btn-cta-signup {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 15px 24px;
  border-radius: 13px;
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.3);
  text-decoration: none;
  transition: background 0.2s, border-color 0.2s;
}

.btn-cta-signup:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.5);
}

.home-footer { background: var(--black); padding: 56px 24px 32px; }
.footer-container { max-width: 1200px; margin: 0 auto; }
.footer-top-row { display: flex; justify-content: space-between; gap: 40px; margin-bottom: 44px; }
.footer-brand-side { max-width: 340px; }
.footer-logo { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; }
.footer-logo .brand-name { color: #fff; }
.footer-tagline { font-size: 14.5px; line-height: 1.6; color: rgba(255, 255, 255, 0.7); margin: 0; }
.footer-nav-groups { display: flex; gap: 64px; }
.footer-col { display: flex; flex-direction: column; gap: 10px; }

.footer-col-title {
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.4px;
  color: #fff;
  margin-bottom: 6px;
}

.footer-link { font-size: 14px; color: rgba(255, 255, 255, 0.7); text-decoration: none; transition: color 0.2s; }
.footer-link:hover { color: #fff; }
.footer-text-tech { font-size: 14px; color: rgba(255, 255, 255, 0.55); }

.footer-bottom-row {
  padding-top: 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.12);
  font-size: 13px;
  color: rgba(255, 255, 255, 0.55);
}

@media (max-width: 1024px) {
  .home-hero-container { grid-template-columns: 1fr; gap: 44px; }
  .hero-visual { max-width: 580px; margin: 0 auto; width: 100%; }
  .bento-grid { grid-template-columns: repeat(2, 1fr); }
  .steps-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 950px) {
  .home-nav-container { grid-template-columns: minmax(0, 1fr) auto; }
  .home-nav-links, .btn-secondary-nav, .btn-ghost, .nav-user-name { display: none; }
  .btn-mobile-toggle { display: block; }
  .nav-user { padding: 5px; }
  .footer-top-row { flex-direction: column; }
  .footer-nav-groups { flex-wrap: wrap; gap: 32px; }
}

@media (max-width: 800px) {
  .home-hero { padding: 48px 18px 56px; }
  .hero-desc { font-size: 16.5px; }
  .hero-visual { padding: 0; }
  .hv-main { padding: 18px; }
  .hv-amount { font-size: 30px; }
  .hv-float { position: relative; top: auto; right: auto; left: auto; bottom: auto; margin-top: 12px; width: 100%; min-width: 0; }
  .bento-grid { grid-template-columns: 1fr; }
  .steps-grid { grid-template-columns: 1fr; }
  .fcard { padding: 22px; min-height: 0; }
  .rank-row span { width: 110px; }
  .cta-banner-container { padding: 46px 22px; }
}

@media (prefers-reduced-motion: reduce) {
  .home-root *, .home-root *::before, .home-root *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}

.nav-link:focus-visible,
.mobile-nav-link:focus-visible,
.home-brand:focus-visible {
  outline: 2px solid #bfdbfe;
  outline-offset: -4px;
  border-radius: 8px;
}

.mobile-nav-link {
  font-size: 17px;
  font-weight: 700;
}

.mobile-nav-link.active {
  color: #fff;
  font-weight: 900;
  text-decoration: underline;
  text-decoration-color: #bfdbfe;
  text-decoration-thickness: 3px;
  text-underline-offset: 7px;
}

@media (max-width: 1100px) {
  .home-nav-container {
    grid-template-columns: minmax(190px, 1fr) auto minmax(150px, 1fr);
    gap: 14px;
    padding: 0 18px;
  }
  .brand-name { font-size: 22px; }
  .brand-tagline { font-size: 11.5px; }
  .nav-link { font-size: 15px; padding: 0 10px; }
}

@media (max-width: 950px) {
  .home-nav-container { grid-template-columns: 1fr auto; }
  .brand-name { font-size: 23px; }
  .brand-tagline { font-size: 12px; }
}

@media (max-width: 480px) {
  .home-nav-container { padding: 0 14px; height: 64px; }
  .home-brand { gap: 7px; }
  .brand-name { font-size: 21px; }
  .brand-tagline { font-size: 10px; padding-left: 7px; }
}
`;