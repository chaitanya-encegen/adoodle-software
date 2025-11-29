import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { endpoints } from "../api";
import { saveToken } from "../auth";
import { toast } from "react-toastify";
import "../styles/login.css";


export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    const res = await fetch(endpoints.login, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (res.ok && data.token) {
      toast.success("Login successful!");
      saveToken(data.token);

      setTimeout(() => navigate("/"), 900);
    } else {
      toast.error(data.error || "Login failed");
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h2 className="login-title">Login</h2>
        <p className="login-subtitle">Access your account securely</p>

        <form onSubmit={handleSubmit} className="login-form">
          <label>Email</label>
          <input
            className="login-input"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Password</label>
          <input
            className="login-input"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button className="login-btn" type="submit">
            Login
          </button>

          <div className="forgot-wrap">
            <Link to="/forgot-password" className="forgot-link">
              Forgot Password?
            </Link>
          </div>
        </form>

        <p className="login-footer">
          {/* Don't have an account? <Link to="/register">Register</Link> */}
        </p>
      </div>
    </div>
  );
}
