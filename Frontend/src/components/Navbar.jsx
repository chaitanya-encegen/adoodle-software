// src/components/Navbar.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { isLoggedIn, clearToken, getRole,getUser} from "../auth";
import "../styles/navbar.css";

export default function Navbar() {
  const navigate = useNavigate();
  const logged = isLoggedIn();
  const role = getRole();
  const user = getUser();
 

  function logout() {
    clearToken();
     
    navigate("/login");
    window.location.reload();
   
  }

  return (
    <div className="topbar">
      <div className="brand">Adoodle</div>

      <div style={{ display: "flex", gap: 18, alignItems: "center" }}>
        {!logged && (
          <>
            <Link to="/">Home</Link>
            <Link to="/login">Login</Link>
          </>
        )}

        {logged && role === "admin" && (
          <>
            <Link to="/">Home</Link>
            <Link to="/admin">Admin Panel</Link>
            <Link to="/register">Add User</Link>
            <Link to="/profile">Account</Link>
            <button onClick={logout} style={{ marginLeft: 12 }}>Logout</button>
          </>
        )}

        {logged && role === "user" && (
          <>
            <Link to="/">Home</Link>
            <Link to="/upload">Upload</Link>
            <Link to="/search">Search</Link>
            <Link to="/selected">Selected Entries</Link>
            {/* <Link to="/history">Search History</Link> */}
            <Link to="/profile">Account</Link>
            <button onClick={logout} style={{ marginLeft: 12 }}>Logout</button>
          </>
        )}
      </div>

    <div style={{ fontWeight: 600, color: "#64748b" }}>
  {logged ? `Welcome, ${user?.name || "User"}` : "Welcome"}
</div>
    </div>
  );
}
