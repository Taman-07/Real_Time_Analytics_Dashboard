import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { FaApple, FaFacebookF } from "react-icons/fa";
import API from "../services/api";

function Signup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  // ============================================================
  // SUBMIT (Preserving exact backend logic & validations)
  // ============================================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.firstName.trim().length < 4) {
      return setError("First name must be at least 4 characters.");
    }

    if (form.lastName.trim().length < 2) {
      return setError("Last name must be at least 2 characters.");
    }

    if (!form.email.trim()) {
      return setError("Please enter your email address.");
    }

    if (form.password.length < 6) {
      return setError("Password must be at least 6 characters.");
    }

    setLoading(true);

    try {
      const response = await API.post("/auth/signup", {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });

      if (response.data?.success) {
        if (response.data?.token) {
          localStorage.setItem("token", response.data.token);
        }

        if (response.data?.user) {
          localStorage.setItem("user", JSON.stringify(response.data.user));
        }

        // Redirect to homepage after signup
        navigate("/", { replace: true });
      } else {
        setError(response.data?.message || "Failed to create account.");
      }
    } catch (err) {
      console.error("SIGNUP ERROR:", err);

      if (err.response) {
        setError(
          err.response.data?.message ||
            err.response.data?.error ||
            "Unable to create account."
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
    <div className="signup-root">
      <style>{signupCss}</style>

      <main className="signup-wrapper">
        <div className="signup-card-split">
          <section className="signup-form-side">
            <div className="form-inner">

              <div className="form-eyebrow">GET STARTED</div>

              <div className="form-header">
                <h1>Create your account.</h1>
                <p>
                  Join Shoplytics to track your store's sales,
                  customers, and orders live.
                </p>
              </div>

              {/* ERROR ALERT */}
              {error && (
                <div className="signup-error-alert" role="alert">
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="signup-form">

                {/* NAME ROW */}
                <div className="form-row-two">
                  <div className="form-group">
                    <label htmlFor="firstName" className="form-label">
                      First name
                    </label>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      className="form-input"
                      placeholder="First name"
                      value={form.firstName}
                      onChange={handleChange}
                      autoComplete="given-name"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="lastName" className="form-label">
                      Last name
                    </label>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      className="form-input"
                      placeholder="Last name"
                      value={form.lastName}
                      onChange={handleChange}
                      autoComplete="family-name"
                      required
                    />
                  </div>
                </div>

                {/* EMAIL */}
                <div className="form-group">
                  <label htmlFor="email" className="form-label">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    className="form-input"
                    placeholder="Enter your email"
                    value={form.email}
                    onChange={handleChange}
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
                      name="password"
                      type={showPassword ? "text" : "password"}
                      className="form-input password-input"
                      placeholder="At least 6 characters"
                      value={form.password}
                      onChange={handleChange}
                      minLength={6}
                      autoComplete="new-password"
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

                  <span className="password-hint">
                    Password must be at least 6 characters long.
                  </span>
                </div>

                {/* SUBMIT */}
                <button
                  type="submit"
                  className="btn-signup-submit"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="btn-spinner-wrap">
                      <span className="spinner" />
                      <span>Creating account...</span>
                    </span>
                  ) : (
                    <span>Create Account</span>
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
                      "Google sign up is simulated. Use the form above."
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
                      "Facebook sign up is simulated. Use the form above."
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
                      "Apple sign up is simulated. Use the form above."
                    )
                  }
                >
                  <FaApple size={20} />
                </button>
              </div>

              {/* FOOTER LINK */}
              <div className="signup-footer-link">
                <span>Already have an account?</span>
                <Link to="/login" className="link-highlight">
                  Log In
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

const signupCss = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');

/* ========================================
   SHOPLYTICS - BLUE + BLACK
   ======================================== */

.signup-root {
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

.signup-wrapper {
  width: 100%;
  max-width: 520px;
  margin: auto;
}

.signup-card-split {
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

.signup-form-side {
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

.signup-error-alert {
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

.signup-form {
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

/* CREATE ACCOUNT BUTTON */

.btn-signup-submit {
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

.btn-signup-submit:hover:not(:disabled) {
  background: #2563eb;
  transform: translateY(-2px);
  box-shadow: 0 14px 32px rgba(59, 130, 246, 0.34);
}

.btn-signup-submit:active:not(:disabled) {
  transform: translateY(0);
}

.btn-signup-submit:focus-visible {
  outline: 2px solid #fff;
  outline-offset: 3px;
}

.btn-signup-submit:disabled {
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
  animation: signupSpin 0.8s linear infinite;
}

@keyframes signupSpin {
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

.signup-footer-link {
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


/* NAME ROW + HINT */

.form-row-two {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.password-hint {
  font-size: 12px;
  color: #6f7a8c;
}

/* RESPONSIVE */

@media (max-width: 560px) {
  .signup-root {
    padding: 14px 10px;
  }

  .signup-card-split {
    padding: 10px;
    border-radius: 20px;
  }

  .signup-form-side {
    padding: 24px 14px;
  }

  .form-header h1 {
    font-size: 31px;
  }

  .social-buttons-row {
    gap: 8px;
  }

  .form-row-two {
    grid-template-columns: 1fr;
  }
}

@media (prefers-reduced-motion: reduce) {
  .signup-root *,
  .signup-root *::before,
  .signup-root *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
`;

export default Signup;