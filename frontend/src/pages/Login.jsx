import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";

import { FcGoogle } from "react-icons/fc";

import {
  FaApple,
  FaEnvelope,
  FaLock,
  FaArrowRight,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ============================================================
  // LOGIN
  // ============================================================

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");

    if (!email.trim()) {
      setError("Please enter your email.");
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

      console.log("Login successful:", response.data);

      // Save token if backend sends one
      if (response.data?.token) {
        localStorage.setItem(
          "token",
          response.data.token
        );
      }

      // Save user if backend sends user data
      if (response.data?.user) {
        localStorage.setItem(
          "user",
          JSON.stringify(response.data.user)
        );
      }

      // Redirect after successful login
      navigate("/analytics", {
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
        setError(
          "Something went wrong. Please try again."
        );
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      <style>{`

        /* ============================================================
           GOOGLE FONT
        ============================================================ */

        @import url(
          'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
        );


        /* ============================================================
           RESET
        ============================================================ */

        * {
          box-sizing: border-box;
        }

        html,
        body,
        #root {
          margin: 0;
          padding: 0;
          min-height: 100%;
        }

        body {
          background: #000000;
        }

        button,
        input {
          font-family: inherit;
        }


        /* ============================================================
           PAGE
        ============================================================ */

        .login-page {
          min-height: 100vh;
          width: 100%;

          display: flex;
          align-items: center;
          justify-content: center;

          padding: 30px;

          font-family:
            "Inter",
            ui-sans-serif,
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;

          background:
            radial-gradient(
              circle at 50% -15%,
              rgba(37, 99, 235, 0.18),
              transparent 36%
            ),
            radial-gradient(
              circle at 100% 100%,
              rgba(14, 165, 233, 0.08),
              transparent 30%
            ),
            #000000;
        }


        /* ============================================================
           MAIN CONTAINER
        ============================================================ */

        .login-container {
          width: 100%;
          max-width: 1140px;

          min-height: 700px;

          display: flex;

          overflow: hidden;

          border:
            1px solid #1c1c1c;

          border-radius: 28px;

          background: #080808;

          box-shadow:
            0 40px 120px
            rgba(0, 0, 0, 0.85);
        }


        /* ============================================================
           LEFT IMAGE PANEL
        ============================================================ */

        .login-left {
          width: 52%;

          position: relative;

          padding: 12px;

          display: flex;

          align-items: center;
          justify-content: center;

          overflow: hidden;

          background:
            linear-gradient(
              145deg,
              #07101d,
              #030507
            );
        }


        /* ============================================================
           BLUE GLOW
        ============================================================ */

        .blue-glow-one {
          position: absolute;

          width: 360px;
          height: 360px;

          top: -180px;
          left: -150px;

          border-radius: 50%;

          background:
            rgba(37, 99, 235, 0.25);

          filter: blur(90px);
        }


        .blue-glow-two {
          position: absolute;

          width: 300px;
          height: 300px;

          right: -150px;
          bottom: -150px;

          border-radius: 50%;

          background:
            rgba(14, 165, 233, 0.15);

          filter: blur(90px);
        }


        /* ============================================================
           IMAGE CARD
        ============================================================ */

        .image-card {
          position: relative;

          z-index: 2;

          width: 100%;
          height: 676px;

          overflow: hidden;

          border-radius: 21px;

          border:
            1px solid
            rgba(255, 255, 255, 0.08);

          background: #050505;

          box-shadow:
            0 25px 70px
            rgba(0, 0, 0, 0.55);
        }


        .image-wrapper {
          position: relative;

          width: 100%;
          height: 100%;

          overflow: hidden;
        }


        .login-image {
          width: 100%;
          height: 100%;

          display: block;

          object-fit: cover;

          object-position: center;

          opacity: 0.84;

          transition:
            transform 0.8s ease,
            opacity 0.4s ease;
        }


        .image-wrapper:hover .login-image {
          transform: scale(1.04);

          opacity: 0.92;
        }


        /* ============================================================
           IMAGE OVERLAY
        ============================================================ */

        .image-overlay {
          position: absolute;

          inset: 0;

          display: flex;

          flex-direction: column;

          justify-content: flex-end;

          padding: 44px;

          background:
            linear-gradient(
              to top,
              rgba(0, 0, 0, 0.96),
              rgba(0, 0, 0, 0.42) 50%,
              rgba(0, 0, 0, 0.03)
            );
        }


        /* ============================================================
           IMAGE TAG
        ============================================================ */

        .image-tag {
          width: fit-content;

          display: inline-flex;

          align-items: center;

          gap: 8px;

          padding:
            8px 13px;

          margin-bottom: 17px;

          border-radius: 100px;

          background:
            rgba(37, 99, 235, 0.14);

          border:
            1px solid
            rgba(96, 165, 250, 0.30);

          color: #93c5fd;

          font-size: 10px;

          font-weight: 700;

          letter-spacing: 1.4px;

          text-transform: uppercase;

          backdrop-filter: blur(12px);
        }


        .tag-dot {
          width: 6px;
          height: 6px;

          border-radius: 50%;

          background: #60a5fa;

          box-shadow:
            0 0 10px
            rgba(96, 165, 250, 0.8);
        }


        .image-overlay h1 {
          margin: 0;

          color: #ffffff;

          font-size: 45px;

          line-height: 1.04;

          letter-spacing: -2.4px;

          font-weight: 700;
        }


        .image-overlay p {
          max-width: 410px;

          margin:
            17px 0 0;

          color: #a1a1aa;

          font-size: 14px;

          line-height: 1.7;

          font-weight: 400;
        }


        /* ============================================================
           RIGHT FORM PANEL
        ============================================================ */

        .login-right {
          width: 48%;

          display: flex;

          align-items: center;

          justify-content: center;

          padding:
            60px 72px;

          background: #080808;
        }


        .form-container {
          width: 100%;

          max-width: 400px;
        }


        /* ============================================================
           BLUE ACCENT
        ============================================================ */

        .top-line {
          width: 42px;
          height: 3px;

          margin-bottom: 27px;

          border-radius: 10px;

          background:
            linear-gradient(
              90deg,
              #3b82f6,
              #60a5fa
            );

          box-shadow:
            0 0 18px
            rgba(59, 130, 246, 0.35);
        }


        /* ============================================================
           HEADING
        ============================================================ */

        .form-container h2 {
          margin: 0;

          color: #fafafa;

          font-size: 44px;

          line-height: 1.08;

          letter-spacing: -2px;

          font-weight: 700;
        }


        /* ============================================================
           SUBTITLE
        ============================================================ */

        .form-subtitle {
          margin-top: 14px;

          margin-bottom: 36px;

          color: #a1a1aa;

          font-size: 15px;

          line-height: 1.65;

          font-weight: 400;
        }


        /* ============================================================
           INPUT GROUP
        ============================================================ */

        .input-group {
          margin-bottom: 20px;
        }


        /* ============================================================
           LABEL
        ============================================================ */

        .input-label {
          display: block;

          margin-bottom: 9px;

          color: #d4d4d8;

          font-size: 13px;

          font-weight: 600;

          letter-spacing: 0.1px;
        }


        /* ============================================================
           INPUT WRAPPER
        ============================================================ */

        .input-wrapper {
          position: relative;
        }


        /* ============================================================
           INPUT ICON
        ============================================================ */

        .input-icon {
          position: absolute;

          left: 17px;

          top: 50%;

          transform: translateY(-50%);

          color: #71717a;

          font-size: 14px;

          pointer-events: none;

          transition:
            color 0.2s ease;
        }


        .input-wrapper:focus-within .input-icon {
          color: #60a5fa;
        }


        /* ============================================================
           INPUT
        ============================================================ */

        .login-input {
          width: 100%;

          height: 57px;

          padding:
            0 50px 0 46px;

          border:
            1px solid #252525;

          border-radius: 12px;

          outline: none;

          background: #0d0d0d;

          color: #fafafa;

          font-family:
            "Inter",
            ui-sans-serif,
            system-ui,
            sans-serif;

          font-size: 15px;

          font-weight: 400;

          letter-spacing: 0;

          transition:
            border-color 0.2s ease,
            background 0.2s ease,
            box-shadow 0.2s ease;
        }


        .login-input::placeholder {
          color: #71717a;

          font-size: 14px;

          font-weight: 400;
        }


        .login-input:hover {
          border-color: #363636;

          background: #101010;
        }


        .login-input:focus {
          border-color: #2563eb;

          background: #0d1117;

          box-shadow:
            0 0 0 3px
            rgba(37, 99, 235, 0.12);
        }


        /* ============================================================
           PASSWORD EYE
        ============================================================ */

        .password-toggle {
          position: absolute;

          right: 14px;

          top: 50%;

          transform: translateY(-50%);

          width: 34px;
          height: 34px;

          display: flex;

          align-items: center;
          justify-content: center;

          border: none;

          background: transparent;

          color: #71717a;

          font-size: 14px;

          cursor: pointer;

          border-radius: 8px;

          transition:
            color 0.2s ease,
            background 0.2s ease;
        }


        .password-toggle:hover {
          color: #93c5fd;

          background:
            rgba(59, 130, 246, 0.10);
        }


        .password-toggle:focus {
          outline: none;

          color: #60a5fa;
        }


        /* ============================================================
           ERROR
        ============================================================ */

        .error-box {
          display: flex;

          align-items: center;

          margin:
            5px 0 16px;

          padding:
            12px 14px;

          border-radius: 10px;

          border:
            1px solid
            rgba(239, 68, 68, 0.25);

          background:
            rgba(239, 68, 68, 0.08);

          color: #fca5a5;

          font-size: 13px;

          line-height: 1.5;

          font-weight: 450;
        }


        /* ============================================================
           LOGIN BUTTON
        ============================================================ */

        .login-button {
          width: 100%;

          height: 57px;

          margin-top: 7px;

          display: flex;

          align-items: center;

          justify-content: center;

          gap: 10px;

          border: none;

          border-radius: 12px;

          background:
            linear-gradient(
              135deg,
              #3b82f6,
              #2563eb
            );

          color: #ffffff;

          font-family:
            "Inter",
            ui-sans-serif,
            system-ui,
            sans-serif;

          font-size: 15px;

          font-weight: 600;

          letter-spacing: 0;

          cursor: pointer;

          box-shadow:
            0 12px 30px
            rgba(37, 99, 235, 0.22);

          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease,
            filter 0.2s ease;
        }


        .login-button:hover {
          transform: translateY(-2px);

          filter: brightness(1.08);

          box-shadow:
            0 16px 38px
            rgba(37, 99, 235, 0.32);
        }


        .login-button:active {
          transform: translateY(0);
        }


        .login-button:disabled {
          opacity: 0.55;

          cursor: not-allowed;

          transform: none;

          box-shadow: none;
        }


        .arrow-icon {
          font-size: 11px;

          transition:
            transform 0.2s ease;
        }


        .login-button:hover .arrow-icon {
          transform: translateX(3px);
        }


        /* ============================================================
           DIVIDER
        ============================================================ */

        .divider {
          display: flex;

          align-items: center;

          gap: 12px;

          margin:
            29px 0 19px;
        }


        .divider-line {
          flex: 1;

          height: 1px;

          background: #1f1f1f;
        }


        .divider-text {
          color: #71717a;

          font-size: 10px;

          font-weight: 600;

          letter-spacing: 1px;

          white-space: nowrap;
        }


        /* ============================================================
           SOCIAL BUTTONS
        ============================================================ */

        .social-buttons {
          display: grid;

          grid-template-columns:
            1fr 1fr;

          gap: 12px;
        }


        .social-button {
          height: 53px;

          display: flex;

          align-items: center;

          justify-content: center;

          gap: 10px;

          border:
            1px solid #252525;

          border-radius: 12px;

          background: #0c0c0c;

          color: #e4e4e7;

          font-family:
            "Inter",
            ui-sans-serif,
            system-ui,
            sans-serif;

          font-size: 14px;

          font-weight: 500;

          cursor: pointer;

          transition:
            border-color 0.2s ease,
            background 0.2s ease,
            transform 0.2s ease;
        }


        .social-button:hover {
          border-color: #3a3a3a;

          background: #111111;

          transform: translateY(-1px);
        }


        .google-icon {
          font-size: 20px;
        }


        .apple-icon {
          color: #ffffff;

          font-size: 19px;
        }


        /* ============================================================
           SIGN UP
        ============================================================ */

        .signup-bottom {
          margin-top: 28px;

          text-align: center;

          color: #71717a;

          font-size: 13px;

          font-weight: 400;
        }


        .signup-bottom a {
          margin-left: 6px;

          color: #60a5fa;

          font-size: 13px;

          font-weight: 600;

          text-decoration: none;

          transition:
            color 0.2s ease;
        }


        .signup-bottom a:hover {
          color: #93c5fd;

          text-decoration: underline;
        }


        /* ============================================================
           RESPONSIVE - TABLET
        ============================================================ */

        @media (max-width: 950px) {

          .login-page {
            padding: 18px;
          }


          .login-container {
            max-width: 520px;

            min-height: auto;
          }


          .login-left {
            display: none;
          }


          .login-right {
            width: 100%;

            min-height: 700px;

            padding:
              60px 50px;
          }

        }


        /* ============================================================
           RESPONSIVE - MOBILE
        ============================================================ */

        @media (max-width: 520px) {

          .login-page {
            padding: 0;

            background: #000000;
          }


          .login-container {
            width: 100%;

            min-height: 100vh;

            border: none;

            border-radius: 0;

            box-shadow: none;
          }


          .login-right {
            width: 100%;

            min-height: 100vh;

            padding:
              40px 22px;
          }


          .top-line {
            margin-bottom: 23px;
          }


          .form-container h2 {
            font-size: 36px;

            letter-spacing: -1.5px;
          }


          .form-subtitle {
            font-size: 14px;

            margin-bottom: 31px;
          }


          .login-input {
            height: 56px;

            font-size: 15px;
          }


          .login-button {
            height: 56px;

            font-size: 15px;
          }


          .social-buttons {
            grid-template-columns: 1fr;
          }

        }

      `}</style>


      {/* ============================================================
          MAIN CONTAINER
      ============================================================ */}

      <div className="login-container">


        {/* ==========================================================
            LEFT IMAGE PANEL
        ========================================================== */}

        <div className="login-left">

          <div className="blue-glow-one"></div>

          <div className="blue-glow-two"></div>


          <div className="image-card">

            <div className="image-wrapper">

              <img
                className="login-image"
                src="https://i.pinimg.com/736x/32/53/ee/3253ee0954569773f430926def883beb.jpg"
                alt="Welcome"
              />


              <div className="image-overlay">
                <h1>
                  Your journey
                  <br />
                  starts here.
                </h1>


                <p>
                  Log in to continue and explore
                  everything waiting for you inside
                  your dashboard.
                </p>

              </div>

            </div>

          </div>

        </div>


        {/* ==========================================================
            RIGHT LOGIN PANEL
        ========================================================== */}

        <div className="login-right">

          <div className="form-container">


            {/* BLUE ACCENT */}

            <div className="top-line"></div>


            {/* HEADING */}

            <h2>
              Welcome back
            </h2>


            <div className="form-subtitle">
              Enter your details below to access your account.
            </div>


            {/* ======================================================
                LOGIN FORM
            ====================================================== */}

            <form onSubmit={handleLogin}>


              {/* EMAIL */}

              <div className="input-group">

                <label className="input-label">
                  Email address
                </label>


                <div className="input-wrapper">

                  <FaEnvelope
                    className="input-icon"
                  />


                  <input
                    className="login-input"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError("");
                    }}
                    autoComplete="email"
                  />

                </div>

              </div>


              {/* PASSWORD */}

              <div className="input-group">

                <label className="input-label">
                  Password
                </label>


                <div className="input-wrapper">

                  <FaLock
                    className="input-icon"
                  />


                  <input
                    className="login-input"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError("");
                    }}
                    autoComplete="current-password"
                  />


                  {/* PASSWORD EYE */}

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowPassword(
                        !showPassword
                      )
                    }
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >

                    {showPassword ? (
                      <FaEyeSlash />
                    ) : (
                      <FaEye />
                    )}

                  </button>

                </div>

              </div>


              {/* ERROR */}

              {error && (

                <div className="error-box">
                  {error}
                </div>

              )}


              {/* LOGIN BUTTON */}

              <button
                type="submit"
                className="login-button"
                disabled={loading}
              >

                {loading
                  ? "Logging in..."
                  : "Login"}

                {!loading && (
                  <FaArrowRight
                    className="arrow-icon"
                  />
                )}

              </button>

            </form>


            {/* ======================================================
                DIVIDER
            ====================================================== */}

            <div className="divider">

              <div className="divider-line"></div>

              <div className="divider-text">
                OR CONTINUE WITH
              </div>

              <div className="divider-line"></div>

            </div>


            {/* ======================================================
                SOCIAL BUTTONS
            ====================================================== */}

            <div className="social-buttons">


              {/* GOOGLE */}

              <button
                type="button"
                className="social-button"
              >

                <FcGoogle
                  className="google-icon"
                />

                Google

              </button>


              {/* APPLE */}

              <button
                type="button"
                className="social-button"
              >

                <FaApple
                  className="apple-icon"
                />

                Apple

              </button>

            </div>


            {/* ======================================================
                SIGN UP
            ====================================================== */}

            <div className="signup-bottom">

              Don't have an account?

              <Link to="/signup">
                Create account
              </Link>

            </div>


          </div>

        </div>

      </div>

    </div>
  );
}

export default Login;