// src/pages/Home.jsx
import React from "react";
import { Link } from "react-router-dom";
import { isLoggedIn, getRole } from "../auth";

import "../styles/home.css";

export default function Home() {
  const logged = isLoggedIn();
  const role = getRole();

  if (!logged) {
    return (
      <div className="home-hero">
        <div className="hero-content">
          <h1>Revolutionize Your TSR Management</h1>
          <p className="subtitle">Effortless, accurate, and futuristic solutions for Title Search Reports.</p>
          <Link to="/login" className="get-started-btn">GET STARTED NOW</Link>
        </div>
      </div>
    );
  }

  if (role === "admin") {
    return (
      <div className="home-dashboard">
        <h1>Admin Dashboard</h1>
        <p className="subtitle">Manage users and system settings</p>
        <Link to="/admin" className="get-started-btn">Go to Admin Panel</Link>
      </div>
    );
  }

  return (
    <div className="home-dashboard">
      <h1>User Dashboard</h1>
      <p className="subtitle">Upload, search and manage your documents</p>
      <Link to="/upload" className="get-started-btn">Start Uploading</Link>
   
    </div>
   
  );
}
