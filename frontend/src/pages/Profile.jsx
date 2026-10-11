import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";

export default function Profile() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ---------- LOAD USER FROM BACKEND & LOCAL STORAGE ---------- */
  useEffect(() => {
    let mounted = true;

    const fetchUserProfile = async () => {
      try {
        setLoading(true);

        // First check backend session
        const response = await API.get("/auth/me");
        if (response.data?.success && response.data?.user) {
          if (mounted) {
            setUser(response.data.user);
            localStorage.setItem("user", JSON.stringify(response.data.user));
          }
        } else {
          // Check local storage fallback
          const localU = localStorage.getItem("user");
          if (localU) {
            if (mounted) setUser(JSON.parse(localU));
          } else {
            navigate("/login");
          }
        }
      } catch (err) {
        console.error("Profile fetch error:", err);
        // Check local storage fallback
        try {
          const localU = localStorage.getItem("user");
          if (localU) {
            if (mounted) setUser(JSON.parse(localU));
          } else {
            navigate("/login");
          }
        } catch {
          navigate("/login");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchUserProfile();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  /* ---------- LOGOUT HANDLER ---------- */
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

  /* ---------- LOADING SKELETON ---------- */
  if (loading) {
    return (
      <div className="profile-root">
        <style>{profileCss}</style>
        <main className="profile-wrapper">
          <div className="profile-card">
            <div className="profile-inner">
              <div className="sk sk-eyebrow" />
              <div className="sk sk-title" />
              <div className="sk sk-field" />
              <div className="sk sk-field" />
              <div className="sk sk-field" />
              <div className="sk sk-button" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  const firstName = user?.firstName || "Admin";
  const lastName = user?.lastName || "";
  const fullName = `${firstName} ${lastName}`.trim();
  const email = user?.email || "admin@shoplytics.com";
  const joinedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "Not available";

  return (
    <div className="profile-root">
      <style>{profileCss}</style>

      <main className="profile-wrapper">
        <div className="profile-card">
          <div className="profile-inner">
            <div className="form-eyebrow">MY PROFILE</div>

            <div className="form-header">
              <h1>Your account.</h1>
              <p>Here are the details linked to your Shoplytics account.</p>
            </div>

            <div className="profile-fields">
              <div className="form-group">
                <span className="form-label">Name</span>
                <div className="field-box">{fullName}</div>
              </div>

              <div className="form-group">
                <span className="form-label">Email</span>
                <div className="field-box">{email}</div>
              </div>

              <div className="form-group">
                <span className="form-label">Joined</span>
                <div className="field-box">{joinedDate}</div>
              </div>
            </div>

            <Link to="/" className="btn-home">
              Go to Homepage
            </Link>

            <button
              type="button"
              className="btn-logout-link"
              onClick={handleLogout}
            >
              Log out
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

/* ============================================================
   STYLES - BLUE + BLACK (matches Login / Signup)
============================================================ */
const profileCss = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');

.profile-root {
  --bg-base: #06080b;
  --card-bg: #0b0e12;
  --input-bg: #11151b;
  --border-color: #1d222a;

  --blue-text: #3b82f6;
  --blue-text-soft: #93c5fd;

  --text-primary: #ffffff;
  --text-secondary: #8b95a5;

  min-height: 100vh;
  background: var(--bg-base);
  color: var(--text-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 24px;
  font-family: Outfit, Inter, -apple-system, BlinkMacSystemFont,
    "Segoe UI", sans-serif;
}

/* MAIN LAYOUT */

.profile-wrapper {
  width: 100%;
  max-width: 500px;
  margin: auto;
}

.profile-card {
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 16px;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 26px;
  box-shadow: 0 35px 100px rgba(0, 0, 0, 0.55);
}

.profile-inner {
  width: 100%;
  max-width: 420px;
  padding: 36px 40px;
  box-sizing: content-box;
}

.form-eyebrow {
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 1.6px;
  color: var(--blue-text);
  margin-bottom: 14px;
}

.form-header {
  margin-bottom: 30px;
}

.form-header h1 {
  font-size: 38px;
  line-height: 1.1;
  font-weight: 800;
  letter-spacing: -1.3px;
  color: #fff;
  margin: 0 0 14px;
}

.form-header p {
  font-size: 15.5px;
  line-height: 1.65;
  color: var(--text-secondary);
  margin: 0;
}

/* FIELDS (read-only, styled like the login inputs) */

.profile-fields {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 28px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 9px;
}

.form-label {
  font-size: 14px;
  font-weight: 500;
  color: #e4e8ee;
}

.field-box {
  display: flex;
  align-items: center;
  min-height: 54px;
  box-sizing: border-box;
  padding: 0 18px;
  border-radius: 12px;
  background: var(--input-bg);
  border: 1px solid var(--border-color);
  color: #fff;
  font-size: 15px;
  word-break: break-word;
}

/* GO TO HOMEPAGE BUTTON */

.btn-home {
  width: 100%;
  min-height: 54px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  border-radius: 12px;
  background: var(--blue-text);
  color: #fff;
  font-family: inherit;
  font-size: 15.5px;
  font-weight: 700;
  text-decoration: none;
  box-shadow: 0 10px 28px rgba(59, 130, 246, 0.24);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    background 0.2s ease;
}

.btn-home:hover {
  background: #2563eb;
  transform: translateY(-2px);
  box-shadow: 0 14px 32px rgba(59, 130, 246, 0.34);
}

.btn-home:active {
  transform: translateY(0);
}

.btn-home:focus-visible {
  outline: 2px solid #fff;
  outline-offset: 3px;
}

/* LOG OUT (small text link) */

.btn-logout-link {
  display: block;
  margin: 22px auto 0;
  padding: 6px 10px;
  background: transparent;
  border: none;
  border-radius: 8px;
  font-family: inherit;
  font-size: 14px;
  font-weight: 600;
  color: #8b95a5;
  cursor: pointer;
  transition: color 0.2s ease;
}

.btn-logout-link:hover {
  color: var(--blue-text-soft);
  text-decoration: underline;
}

.btn-logout-link:focus-visible {
  outline: 2px solid var(--blue-text);
  outline-offset: 2px;
}

/* LOADING SKELETON */

.sk {
  border-radius: 12px;
  background: linear-gradient(90deg, #11151b 25%, #1a2029 50%, #11151b 75%);
  background-size: 200% 100%;
  animation: profileShimmer 1.4s infinite;
}

.sk-eyebrow { height: 14px; width: 110px; margin-bottom: 18px; }
.sk-title { height: 42px; width: 260px; margin-bottom: 34px; }
.sk-field { height: 54px; margin-bottom: 20px; }
.sk-button { height: 54px; margin-top: 8px; }

@keyframes profileShimmer {
  to { background-position: -200% 0; }
}

/* RESPONSIVE */

@media (max-width: 560px) {
  .profile-root {
    padding: 14px 10px;
  }

  .profile-card {
    padding: 10px;
    border-radius: 20px;
  }

  .profile-inner {
    padding: 24px 14px;
  }

  .form-header h1 {
    font-size: 31px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .profile-root *,
  .profile-root *::before,
  .profile-root *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
`;