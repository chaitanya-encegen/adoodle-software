// src/AdminRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { isLoggedIn, getRole } from "./auth";

export default function AdminRoute({ children }) {
  if (!isLoggedIn()) return <Navigate to="/login" replace />;
  const role = getRole();
  if (role !== "admin") return <Navigate to="/" replace />;
  return children;
}
