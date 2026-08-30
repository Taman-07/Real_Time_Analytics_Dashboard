import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  Eye,
  EyeOff,
  ArrowRight,
  Mail,
  Lock,
  User,
} from "lucide-react";

import API from "../services/api";

function Signup() {
  const navigate = useNavigate();

  // ============================================================
  // FORM STATE
  // ============================================================

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);

  // ============================================================
  // HANDLE CHANGE
  // ============================================================

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

    setError("");
  };

  // ============================================================
  // SIGNUP
  // ============================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    // Frontend validation
    if (form.firstName.trim().length < 4) {
      setError("First name must be at least 4 characters.");
      return;
    }

    if (form.lastName.trim().length < 2) {
      setError("Last name must be at least 2 characters.");
      return;
    }

    if (!form.email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const response = await API.post("/auth/signup", {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });

      console.log("SIGNUP RESPONSE:", response.data);

      if (response.data?.success) {
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

        navigate("/analytics", {
          replace: true,
        });
      } else {
        setError(
          response.data?.message ||
            "Failed to create account."
        );
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
        setError(
          "Something went wrong. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-page">

      <style>{`

        @import url(
          'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap'
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

        .signup-page {
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

        .signup-container {
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

        .signup-left {
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

        .signup-glow-one {
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


        .signup-glow-two {
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

        .signup-image-card {
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


        .signup-image-wrapper {
          position: relative;

          width: 100%;
          height: 100%;

          overflow: hidden;
        }


        /* ============================================================
           IMAGE
        ============================================================ */

        .signup-image {
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


        .signup-image-wrapper:hover
        .signup-image {
          transform: scale(1.04);

          opacity: 0.92;
        }


        /* ============================================================
           IMAGE OVERLAY
        ============================================================ */

        .signup-image-overlay {
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

        .signup-image-tag {
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


        .signup-tag-dot {
          width: 6px;
          height: 6px;

          border-radius: 50%;

          background: #60a5fa;

          box-shadow:
            0 0 10px
            rgba(96, 165, 250, 0.8);
        }


        /* ============================================================
           IMAGE HEADING
        ============================================================ */

        .signup-image-overlay h1 {
          margin: 0;

          color: #ffffff;

          font-size: 45px;

          line-height: 1.04;

          letter-spacing: -2.4px;

          font-weight: 700;
        }


        .signup-image-overlay p {
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

        .signup-right {
          width: 48%;

          display: flex;

          align-items: center;

          justify-content: center;

          padding:
            60px 72px;

          background: #080808;
        }


        .signup-form-container {
          width: 100%;

          max-width: 410px;
        }


        /* ============================================================
           BLUE ACCENT
        ============================================================ */

        .signup-top-line {
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

        .signup-heading h2 {
          margin: 0;

          color: #fafafa;

          font-size: 44px;

          line-height: 1.08;

          letter-spacing: -2px;

          font-weight: 700;
        }


        .signup-heading p {
          margin-top: 14px;

          margin-bottom: 36px;

          color: #a1a1aa;

          font-size: 15px;

          line-height: 1.65;

          font-weight: 400;
        }


        /* ============================================================
           DIVIDER
        ============================================================ */

        .signup-divider {
          width: 100%;

          height: 1px;

          margin-bottom: 27px;

          background: #1f1f1f;
        }


        /* ============================================================
           ERROR
        ============================================================ */

        .signup-error {
          display: flex;

          align-items: center;

          margin:
            5px 0 18px;

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
           NAME ROW
        ============================================================ */

        .name-row {
          display: grid;

          grid-template-columns:
            1fr 1fr;

          gap: 14px;
        }


        /* ============================================================
           FORM GROUP
        ============================================================ */

        .signup-form-group {
          margin-bottom: 20px;
        }


        /* ============================================================
           LABEL
        ============================================================ */

        .signup-label {
          display: block;

          margin-bottom: 9px;

          color: #d4d4d8;

          font-size: 13px;

          font-weight: 600;
        }


        /* ============================================================
           INPUT WRAPPER
        ============================================================ */

        .signup-input-wrapper {
          position: relative;

          width: 100%;
        }


        /* ============================================================
           INPUT ICON
        ============================================================ */

        .signup-input-icon {
          position: absolute;

          left: 16px;

          top: 50%;

          transform:
            translateY(-50%);

          color: #71717a;

          font-size: 15px;

          pointer-events: none;

          transition:
            color 0.2s ease;
        }


        .signup-input-wrapper:focus-within
        .signup-input-icon {
          color: #60a5fa;
        }


        /* ============================================================
           ALL INPUTS
        ============================================================ */

        .signup-input {
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

          transition:
            border-color 0.2s ease,
            background 0.2s ease,
            box-shadow 0.2s ease;
        }


        .signup-input::placeholder {
          color: #71717a;

          font-size: 14px;
        }


        .signup-input:hover {
          border-color: #363636;

          background: #101010;
        }


        .signup-input:focus {
          border-color: #2563eb;

          background: #0d1117;

          box-shadow:
            0 0 0 3px
            rgba(37, 99, 235, 0.12);
        }


        /* ============================================================
           PASSWORD WRAPPER
        ============================================================ */

        .signup-password-wrapper {
          position: relative;

          width: 100%;
        }


        /* ============================================================
           PASSWORD INPUT
        ============================================================ */

        .signup-password-input {
          width: 100%;

          height: 57px;

          padding:
            0 52px 0 46px;

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

          transition:
            border-color 0.2s ease,
            background 0.2s ease,
            box-shadow 0.2s ease;
        }


        .signup-password-input::placeholder {
          color: #71717a;

          font-size: 14px;
        }


        .signup-password-input:hover {
          border-color: #363636;

          background: #101010;
        }


        .signup-password-input:focus {
          border-color: #2563eb;

          background: #0d1117;

          box-shadow:
            0 0 0 3px
            rgba(37, 99, 235, 0.12);
        }


        /* ============================================================
           PASSWORD LOCK ICON
        ============================================================ */

        .signup-password-icon {
          position: absolute;

          left: 16px;

          top: 50%;

          transform:
            translateY(-50%);

          color: #71717a;

          pointer-events: none;

          transition:
            color 0.2s ease;
        }


        .signup-password-wrapper:focus-within
        .signup-password-icon {
          color: #60a5fa;
        }


        /* ============================================================
           ONLY ONE EYE BUTTON
        ============================================================ */

        .signup-password-toggle {
          position: absolute;

          right: 12px;

          top: 50%;

          transform:
            translateY(-50%);

          width: 36px;

          height: 36px;

          display: flex;

          align-items: center;

          justify-content: center;

          border: none;

          outline: none;

          border-radius: 8px;

          background: transparent;

          color: #71717a;

          cursor: pointer;

          padding: 0;
        }


        .signup-password-toggle:hover {
          color: #93c5fd;

          background:
            rgba(59, 130, 246, 0.10);
        }


        .signup-password-toggle:focus {
          outline: none;

          color: #60a5fa;
        }


        /* ============================================================
           PASSWORD HINT
        ============================================================ */

        .signup-password-hint {
          margin-top: 7px;

          color: #71717a;

          font-size: 11px;
        }


        /* ============================================================
           CREATE ACCOUNT BUTTON
        ============================================================ */

        .signup-button {
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

          cursor: pointer;

          box-shadow:
            0 12px 30px
            rgba(37, 99, 235, 0.22);

          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease,
            filter 0.2s ease;
        }


        .signup-button:hover {
          transform:
            translateY(-2px);

          filter:
            brightness(1.08);

          box-shadow:
            0 16px 38px
            rgba(37, 99, 235, 0.32);
        }


        .signup-button:active {
          transform:
            translateY(0);
        }


        .signup-button:disabled {
          opacity: 0.55;

          cursor: not-allowed;

          transform: none;

          box-shadow: none;
        }


        .signup-arrow {
          transition:
            transform 0.2s ease;
        }


        .signup-button:hover
        .signup-arrow {
          transform:
            translateX(3px);
        }


        /* ============================================================
           OR DIVIDER
        ============================================================ */

        .signup-or-divider {
          display: flex;

          align-items: center;

          gap: 12px;

          margin:
            29px 0 19px;

          color: #71717a;

          font-size: 10px;

          font-weight: 600;

          letter-spacing: 1px;
        }


        .signup-or-divider::before,
        .signup-or-divider::after {
          content: "";

          flex: 1;

          height: 1px;

          background: #1f1f1f;
        }


        /* ============================================================
           LOGIN LINK
        ============================================================ */

        .signup-bottom {
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
           TABLET
        ============================================================ */

        @media (max-width: 950px) {

          .signup-page {
            padding: 18px;
          }


          .signup-container {
            max-width: 520px;

            min-height: auto;
          }


          .signup-left {
            display: none;
          }


          .signup-right {
            width: 100%;

            min-height: 700px;

            padding:
              60px 50px;
          }

        }


        /* ============================================================
           MOBILE
        ============================================================ */

        @media (max-width: 520px) {

          .signup-page {
            padding: 0;

            background: #000000;
          }


          .signup-container {
            width: 100%;

            min-height: 100vh;

            border: none;

            border-radius: 0;

            box-shadow: none;
          }


          .signup-right {
            width: 100%;

            min-height: 100vh;

            padding:
              40px 22px;
          }


          .signup-top-line {
            margin-bottom: 23px;
          }


          .signup-heading h2 {
            font-size: 36px;

            letter-spacing: -1.5px;
          }


          .signup-heading p {
            font-size: 14px;

            margin-bottom: 31px;
          }


          .signup-input,
          .signup-password-input {
            height: 56px;

            font-size: 15px;
          }


          .signup-button {
            height: 56px;

            font-size: 15px;
          }

        }


        /* ============================================================
           SMALL MOBILE
        ============================================================ */

        @media (max-width: 480px) {

          .signup-right {
            padding:
              35px 20px;
          }


          .signup-heading h2 {
            font-size: 32px;
          }


          .name-row {
            grid-template-columns: 1fr;

            gap: 0;
          }

        }

      `}</style>


      {/* ============================================================
          MAIN CONTAINER
      ============================================================ */}

      <div className="signup-container">


        {/* ==========================================================
            LEFT SIDE
        ========================================================== */}

        <div className="signup-left">

          <div className="signup-glow-one"></div>

          <div className="signup-glow-two"></div>


          {/* IMAGE */}

          <div className="signup-image-card">

            <div className="signup-image-wrapper">

              <img
                className="signup-image"
                src="https://i.pinimg.com/736x/40/21/41/402141967f99db74c27b8e0db9482dc1.jpg"
                alt="Analytics"
              />


              <div className="signup-image-overlay">


                <h1>

                  Insights today,
                  <br />

                  growth tomorrow.

                </h1>


                <p>

                  Create your account and
                  start exploring powerful
                  analytics and insights.

                </p>

              </div>

            </div>

          </div>

        </div>


        {/* ==========================================================
            RIGHT SIDE
        ========================================================== */}

        <div className="signup-right">

          <div className="signup-form-container">


            {/* BLUE LINE */}

            <div className="signup-top-line"></div>


            {/* HEADING */}

            <div className="signup-heading">

              <h2>
                Create account
              </h2>

              <p>
                Start your journey with us today.
              </p>

            </div>


            {/* DIVIDER */}

            <div className="signup-divider"></div>


            {/* ERROR */}

            {error && (

              <div className="signup-error">

                {error}

              </div>

            )}


            {/* ======================================================
                FORM
            ====================================================== */}

            <form onSubmit={handleSubmit}>


              {/* ====================================================
                  FIRST + LAST NAME
              ==================================================== */}

              <div className="name-row">


                {/* FIRST NAME */}

                <div className="signup-form-group">

                  <label className="signup-label">
                    First name
                  </label>


                  <div className="signup-input-wrapper">

                    <User
                      className="signup-input-icon"
                      size={17}
                    />


                    <input
                      className="signup-input"

                      type="text"

                      name="firstName"

                      placeholder="First name"

                      value={form.firstName}

                      onChange={handleChange}

                      autoComplete="given-name"

                      required
                    />

                  </div>

                </div>


                {/* LAST NAME */}

                <div className="signup-form-group">

                  <label className="signup-label">
                    Last name
                  </label>


                  <div className="signup-input-wrapper">

                    <User
                      className="signup-input-icon"
                      size={17}
                    />


                    <input
                      className="signup-input"

                      type="text"

                      name="lastName"

                      placeholder="Last name"

                      value={form.lastName}

                      onChange={handleChange}

                      autoComplete="family-name"

                      required
                    />

                  </div>

                </div>

              </div>


              {/* ====================================================
                  EMAIL
              ==================================================== */}

              <div className="signup-form-group">

                <label className="signup-label">
                  Email address
                </label>


                <div className="signup-input-wrapper">

                  <Mail
                    className="signup-input-icon"
                    size={17}
                  />


                  <input
                    className="signup-input"

                    type="email"

                    name="email"

                    placeholder="you@example.com"

                    value={form.email}

                    onChange={handleChange}

                    autoComplete="email"

                    required
                  />

                </div>

              </div>


              {/* ====================================================
                  PASSWORD
              ==================================================== */}

              <div className="signup-form-group">

                <label className="signup-label">
                  Password
                </label>


                <div className="signup-password-wrapper">


                  {/* LOCK ICON */}

                  <Lock
                    className="signup-password-icon"
                    size={17}
                  />


                  {/* PASSWORD INPUT */}

                  <input
                    className="signup-password-input"

                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }

                    name="password"

                    placeholder="Enter your password"

                    value={form.password}

                    onChange={handleChange}

                    minLength={6}

                    autoComplete="new-password"

                    required
                  />


                  {/* ONLY ONE EYE */}

                  <button
                    type="button"

                    className="signup-password-toggle"

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

                      <EyeOff size={18} />

                    ) : (

                      <Eye size={18} />

                    )}

                  </button>

                </div>


                <div className="signup-password-hint">

                  Password must be at least 6 characters.

                </div>

              </div>


              {/* ====================================================
                  CREATE ACCOUNT BUTTON
              ==================================================== */}

              <button
                type="submit"

                className="signup-button"

                disabled={loading}
              >

                {loading
                  ? "Creating account..."
                  : "Create account"
                }


                {!loading && (

                  <ArrowRight
                    size={19}
                    className="signup-arrow"
                  />

                )}

              </button>

            </form>


            {/* ======================================================
                OR
            ====================================================== */}

            <div className="signup-or-divider">

              <span>
                OR
              </span>

            </div>


            {/* ======================================================
                LOGIN
            ====================================================== */}

            <div className="signup-bottom">

              Already have an account?

              <Link to="/login">
                Log in
              </Link>

            </div>


          </div>

        </div>

      </div>

    </div>
  );
}

export default Signup;