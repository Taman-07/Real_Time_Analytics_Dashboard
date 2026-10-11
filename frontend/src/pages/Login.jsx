import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { FaApple, FaFacebookF } from "react-icons/fa";
import API from "../services/api";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // LOGIN LOGIC - UNCHANGED
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!password.trim()) {
      setError("Please enter your password.");
      return;
    }

    try {
      setLoading(true);

      const response = await API.post(
        "/auth/login",
        {
          email: email.trim().toLowerCase(),
          password: password.trim(),
        },
        {
          withCredentials: true,
        }
      );

      if (response.data?.token) {
        localStorage.setItem("token", response.data.token);
      }

      if (response.data?.user) {
        localStorage.setItem(
          "user",
          JSON.stringify(response.data.user)
        );
      }

      navigate("/", {
        replace: true,
      });
    } catch (err) {
      console.error("Login error:", err);

      if (err.response) {
        setError(
          err.response.data?.message ||
            err.response.data?.error ||
            "Invalid email or password."
        );
      } else if (err.request) {
        setError(
          "Unable to connect to the server. Please make sure your backend is running."
        );
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-root">
      <style>{loginCss}</style>

      <main className="login-wrapper">
        <div className="login-card-split">

          {/* LEFT SIDE - FORM */}
          <section className="login-form-side">
            <div className="form-inner">

              <div className="form-eyebrow">WELCOME BACK</div>

              <div className="form-header">
                <h1>Log in to continue.</h1>
                <p>
                  Continue managing your store, tracking orders,
                  and growing your sales.
                </p>
              </div>

              {error && (
                <div className="login-error-alert" role="alert">
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="login-form">

                {/* EMAIL */}
                <div className="form-group">
                  <label htmlFor="email" className="form-label">
                    Email
                  </label>

                  <input
                    id="email"
                    type="email"
                    className="form-input"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError("");
                    }}
                    autoComplete="email"
                    required
                  />
                </div>

                {/* PASSWORD */}
                <div className="form-group">
                  <label htmlFor="password" className="form-label">
                    Password
                  </label>

                  <div className="input-wrap">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      className="form-input password-input"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setError("");
                      }}
                      autoComplete="current-password"
                      required
                    />

                    <button
                      type="button"
                      className="btn-password-toggle"
                      onClick={() =>
                        setShowPassword((previous) => !previous)
                      }
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </div>

                {/* SUBMIT */}
                <button
                  type="submit"
                  className="btn-login-submit"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="btn-spinner-wrap">
                      <span className="spinner" />
                      <span>Logging in...</span>
                    </span>
                  ) : (
                    <span>Log In</span>
                  )}
                </button>
              </form>

              {/* SOCIAL DIVIDER */}
              <div className="social-divider">
                <span className="divider-line" />
                <span className="divider-text">OR CONTINUE WITH</span>
                <span className="divider-line" />
              </div>

              {/* SOCIAL BUTTONS */}
              <div className="social-buttons-row">
                <button
                  type="button"
                  className="btn-social"
                  aria-label="Continue with Google"
                  onClick={() =>
                    setError(
                      "Google login is simulated. Use email and password."
                    )
                  }
                >
                  <FcGoogle size={20} />
                </button>

                <button
                  type="button"
                  className="btn-social"
                  aria-label="Continue with Facebook"
                  onClick={() =>
                    setError(
                      "Facebook login is simulated. Use email and password."
                    )
                  }
                >
                  <FaFacebookF size={17} color="#1877f2" />
                </button>

                <button
                  type="button"
                  className="btn-social"
                  aria-label="Continue with Apple"
                  onClick={() =>
                    setError(
                      "Apple login is simulated. Use email and password."
                    )
                  }
                >
                  <FaApple size={20} />
                </button>
              </div>

              <div className="login-footer-link">
                <span>Don't have an account?</span>
                <Link to="/signup" className="link-highlight">
                  Sign Up
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

const loginCss = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');

/* ========================================
   SHOPLYTICS - BLUE + BLACK
   ======================================== */

.login-root {
  --bg-base: #06080b;
  --card-bg: #0b0e12;
  --input-bg: #11151b;
  --border-color: #1d222a;

  --blue-text: #3b82f6;      /* eyebrow, button, focus */
  --blue-text-soft: #93c5fd; /* link hover */

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

.login-wrapper {
  width: 100%;
  max-width: 500px;
  margin: auto;
}

.login-card-split {
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 16px;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 26px;
  box-shadow: 0 35px 100px rgba(0, 0, 0, 0.55);
}

/* LEFT - FORM */

.login-form-side {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 36px 40px;
}

.form-inner {
  width: 100%;
  max-width: 420px;
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

/* ERROR */

.login-error-alert {
  padding: 13px 15px;
  border-radius: 12px;
  background: rgba(238, 10, 53, 0.1);
  border: 1px solid rgba(255, 51, 85, 0.35);
  color: #ffb3bf;
  font-size: 13.5px;
  line-height: 1.6;
  margin-bottom: 20px;
}

/* FORM */

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
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

/* INPUTS */

.input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.form-input {
  width: 100%;
  height: 54px;
  box-sizing: border-box;
  padding: 0 18px;
  border-radius: 12px;
  background: var(--input-bg);
  border: 1px solid var(--border-color);
  color: #fff;
  font-family: inherit;
  font-size: 15px;
  outline: none;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    background 0.2s ease;
}

.form-input::placeholder {
  color: #5d6676;
}

.form-input:hover {
  border-color: #2b323d;
}

.form-input:focus {
  background: #131820;
  border-color: var(--blue-text);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.16);
}

.password-input {
  padding-right: 52px;
}

/* PASSWORD EYE BUTTON */

.btn-password-toggle {
  position: absolute;
  right: 11px;
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 8px;
  color: #9aa3b2;
  cursor: pointer;
  padding: 0;
  transition:
    color 0.2s ease,
    background 0.2s ease;
}

.btn-password-toggle:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.06);
}

.btn-password-toggle:focus-visible {
  outline: 2px solid var(--blue-text);
  outline-offset: 2px;
}

/* hide the browser's built-in password reveal icon (Edge/IE) so only one eye shows */
.form-input::-ms-reveal,
.form-input::-ms-clear {
  display: none;
}

/* LOG IN BUTTON */

.btn-login-submit {
  width: 100%;
  min-height: 54px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border-radius: 12px;
  background: var(--blue-text);
  border: none;
  color: #fff;
  font-family: inherit;
  font-size: 15.5px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 10px 28px rgba(59, 130, 246, 0.24);
  margin-top: 2px;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    background 0.2s ease;
}

.btn-login-submit:hover:not(:disabled) {
  background: #2563eb;
  transform: translateY(-2px);
  box-shadow: 0 14px 32px rgba(59, 130, 246, 0.34);
}

.btn-login-submit:active:not(:disabled) {
  transform: translateY(0);
}

.btn-login-submit:focus-visible {
  outline: 2px solid #fff;
  outline-offset: 3px;
}

.btn-login-submit:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.btn-spinner-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.35);
  border-top-color: #fff;
  border-radius: 50%;
  animation: loginSpin 0.8s linear infinite;
}

@keyframes loginSpin {
  to {
    transform: rotate(360deg);
  }
}

/* SOCIAL LOGIN */

.social-divider {
  display: flex;
  align-items: center;
  gap: 14px;
  margin: 28px 0 22px;
}

.divider-line {
  height: 1px;
  flex: 1;
  background: var(--border-color);
}

.divider-text {
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.8px;
  color: #7c8697;
  white-space: nowrap;
}

.social-buttons-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.btn-social {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 50px;
  border-radius: 12px;
  background: var(--input-bg);
  border: 1px solid var(--border-color);
  color: #fff;
  cursor: pointer;
  transition:
    background 0.2s ease,
    border-color 0.2s ease,
    transform 0.2s ease;
}

.btn-social:hover {
  background: #171c24;
  border-color: #25406a;
  transform: translateY(-1px);
}

.btn-social:focus-visible {
  outline: 2px solid var(--blue-text);
  outline-offset: 2px;
}

/* FOOTER */

.login-footer-link {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 6px;
  text-align: center;
  margin-top: 30px;
  color: #8b95a5;
  font-size: 14px;
}

.link-highlight {
  color: #fff;
  text-decoration: none;
  font-weight: 700;
  transition: color 0.2s ease;
}

.link-highlight:hover {
  color: var(--blue-text-soft);
  text-decoration: underline;
}

/* RESPONSIVE */

@media (max-width: 560px) {
  .login-root {
    padding: 14px 10px;
  }

  .login-card-split {
    padding: 10px;
    border-radius: 20px;
  }

  .login-form-side {
    padding: 24px 14px;
  }

  .form-header h1 {
    font-size: 31px;
  }

  .social-buttons-row {
    gap: 8px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .login-root *,
  .login-root *::before,
  .login-root *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
`;

export default Login;