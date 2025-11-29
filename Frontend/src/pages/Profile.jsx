// pages/Profile.jsx
import React, { useEffect, useState } from "react";
import { authFetch } from "../auth";
import { endpoints } from "../api";
import "../styles/Profile.css";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: "",
    password: ""
  });

  async function loadProfile() {
    setLoading(true);
    const res = await authFetch(endpoints.profile);
    const data = await res.json();
    setProfile(data);
    setForm({ name: data.name, password: "" });
    setLoading(false);
  }

  useEffect(() => {
    loadProfile();
  }, []);

  async function updateProfile(e) {
    e.preventDefault();

    const body = {};
    if (form.name !== profile.name) body.name = form.name;
    if (form.password.trim() !== "") body.password = form.password;

    if (Object.keys(body).length === 0) {
      alert("Nothing to update");
      return;
    }

    const res = await authFetch(endpoints.updateProfile, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    const data = await res.json();
    if (!res.ok) return alert(data.error || "Update failed");

    alert("Profile updated");
    setEditing(false);
    loadProfile();
  }

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="profile-container">
      {!editing && (
        <div className="card">
          <h2 className="profile-title">Hello, {profile.name}...</h2>

          <p><span className="label">Name:</span> {profile.name}</p>
          <p><span className="label">Email:</span> {profile.email}</p>

          <p>
            <span className="label">Joined:</span>{" "}
            {new Date(profile.created_at).toLocaleString()}
          </p>

          <p>
            <span className="label">Subscription Validity:</span>{" "}
            {profile.expiry_date
              ? new Date(profile.expiry_date).toLocaleString()
              : "none"}
          </p>

          <button onClick={() => setEditing(true)} className="btn primary">
            Edit Account
          </button>
        </div>
      )}

      {editing && (
        <form onSubmit={updateProfile} className="card form-card">
          <label className="label">Name:</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="input"
          />

          <label className="label">New Password (optional):</label>
          <input
            type="password"
            placeholder="Leave blank to keep current"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="input"
          />

          <div className="btn-group">
            <button className="btn success" type="submit">Save</button>
            <button
              className="btn secondary"
              type="button"
              onClick={() => setEditing(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
