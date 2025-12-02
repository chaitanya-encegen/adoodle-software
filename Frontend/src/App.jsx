// src/App.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { isLoggedIn } from "./auth";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Upload from "./pages/Upload";
import Search from "./pages/Search";
import Selected from "./pages/selected";
import History from "./pages/History";
import Forgot from "./pages/Forgot";
import ResetPassword from "./pages/ResetPassword";
import Profile from "./pages/Profile";
import AdminRoute from "./AdminRoute";
import AdminDashboard from "./pages/AdminDashboard";

function PrivateRoute({ children }) {
  return isLoggedIn() ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <>
      <Navbar />
      <ToastContainer position="top-right" autoClose={2500} theme="colored" />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={!isLoggedIn() ? <Login /> : <Navigate to="/" />} />
        {/* Register route is admin-only */}
        <Route path="/register" element={<AdminRoute><Register /></AdminRoute>} />
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />

        <Route path="/upload" element={<PrivateRoute><Upload /></PrivateRoute>} />
        <Route path="/search" element={<PrivateRoute><Search /></PrivateRoute>} />
        <Route path="/selected" element={<PrivateRoute><Selected /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="/history" element={<PrivateRoute><History /></PrivateRoute>} />

        <Route path="/forgot-password" element={<Forgot />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
          <Footer />
    </>
  );
}
