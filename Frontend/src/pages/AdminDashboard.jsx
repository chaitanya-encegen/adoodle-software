// Updated AdminDashboard.jsx with Delete User Support
import React, { useEffect, useState } from "react";
import { endpoints } from "../api";
import { authFetch, getUser } from "../auth";
import { toast } from "react-toastify";
import { MdDelete } from "react-icons/md";
import { AiFillDelete } from "react-icons/ai";

import { FaTrash } from "react-icons/fa";

import "../styles/AdminDashboard.css";

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selectedUser, setSelectedUser] = useState(null);
  const [editingUser, setEditingUser] = useState(null);

  const currentUser = getUser();

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    setLoading(true);
    try {
      const res = await authFetch(endpoints.adminUsers);
      const data = await res.json();
      if (!res.ok) toast.error(data.error || "Failed to load users");
      else setUsers(data.users || []);
    } catch (e) {
      toast.error("Network error");
    }
    setLoading(false);
  }

  function openProfile(u) {
    setSelectedUser(u);
    setEditingUser({
      ...u,
      new_password: "",
    });
  }

  function closeProfile() {
    setSelectedUser(null);
    setEditingUser(null);
  }

  async function saveProfile() {
    try {
      const payload = { ...editingUser };
      if (!payload.new_password) delete payload.new_password;

      const res = await authFetch(endpoints.adminUpdateUser, {
        method: "POST",
        body: payload,
      });

      const data = await res.json();
      if (!res.ok) return toast.error(data.error || "Failed to update user");

      toast.success("User updated");
      closeProfile();
      loadUsers();
    } catch (e) {
      toast.error("Network error");
    }
  }

  async function toggleStatus(user) {
    if (user.id === currentUser?.sub)
      return toast.error("Cannot change your own status");

    const res = await authFetch(endpoints.adminSetStatus, {
      method: "POST",
      body: { user_id: user.id, status: !user.is_active },
    });

    const data = await res.json();
    if (!res.ok) return toast.error(data.error || "Failed");

    toast.success("Status updated");
    loadUsers();
  }

  async function updateExpiry(user, expiry) {
    const res = await authFetch(endpoints.adminSetExpiry, {
      method: "POST",
      body: { user_id: user.id, expiry_date: expiry },
    });

    const data = await res.json();
    if (!res.ok) return toast.error(data.error || "Failed to update expiry");

    toast.success("Expiry updated");
    loadUsers();
  }

  // --------------------------------------------------
  // 🚨 NEW: DELETE USER
  // --------------------------------------------------
  async function deleteUser(user) {
    if (user.id === currentUser?.sub) {
      return toast.error("You cannot delete your own account!");
    }

    if (!window.confirm(`Delete user "${user.email}" permanently?`)) return;

    try {
      const res = await authFetch(endpoints.adminDeleteUser, {
        method: "POST",
        body: { user_id: user.id },
      });

      const data = await res.json();
      if (!res.ok) return toast.error(data.error || "Failed to delete user");

      toast.success("User deleted");
      loadUsers();
    } catch (e) {
      toast.error("Network error");
    }
  }

  return (
    <div className="admin-container">
      <h1>Admin Panel — Users</h1>

      {loading ? (
        <p className="loading">Loading...</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Joining Date</th>
              <th>Subscription Validity</th>
              <th>Actions</th>
              <th>Delete</th> {/* NEW COLUMN */}
            </tr>
          </thead>

          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>
                  <button className="name-btn" onClick={() => openProfile(u)}>
                    {u.name}
                  </button>
                </td>

                <td>
                  <button className="name-btn" onClick={() => openProfile(u)}>
                    {u.email}
                  </button>
                </td>

                <td>{u.is_admin ? "Admin" : "User"}</td>
                <td>{u.is_active ? "Active" : "Inactive"}</td>

                <td>{u.created_at ? u.created_at.slice(0, 10) : "-"}</td>

                <td>
                  <input
                    type="datetime-local"
                    defaultValue={u.expiry_date ? u.expiry_date.slice(0, 16) : ""}
                    onChange={(e) => updateExpiry(u, e.target.value)}
                    className="expiry-input"
                  />
                </td>

                <td>
                  <button
                    onClick={() => toggleStatus(u)}
                    disabled={u.id === (currentUser && parseInt(currentUser.sub))}
                    className={`action-btn ${
                      u.is_active ? "action-deactivate" : "action-activate"
                    }`}
                  >
                    {u.is_active ? "Deactivate" : "Activate"}
                  </button>
                </td>

                {/* DELETE BUTTON */}
                <td>
                  <button
                    className="delete-btn"
                    onClick={() => deleteUser(u)}
                    disabled={u.id === currentUser?.sub}
                  >
                    <AiFillDelete size={20} />


                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* PROFILE MODAL */}
      {selectedUser && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h2>Edit User Profile</h2>

            <label>Name</label>
            <input
              className="modal-input"
              value={editingUser.name}
              onChange={(e) =>
                setEditingUser({ ...editingUser, name: e.target.value })
              }
            />

            <label>Email</label>
            <input
              className="modal-input"
              value={editingUser.email}
              onChange={(e) =>
                setEditingUser({ ...editingUser, email: e.target.value })
              }
            />

            <label>Phone</label>
            <input
              className="modal-input"
              value={editingUser.phone1 || ""}
              onChange={(e) =>
                setEditingUser({ ...editingUser, phone1: e.target.value })
              }
            />

            <label>Alternate Phone</label>
            <input
              className="modal-input"
              value={editingUser.phone2 || ""}
              onChange={(e) =>
                setEditingUser({ ...editingUser, phone2: e.target.value })
              }
            />

            <label>Address</label>
            <textarea
              className="modal-textarea"
              value={editingUser.address || ""}
              onChange={(e) =>
                setEditingUser({ ...editingUser, address: e.target.value })
              }
            />

            <label>Reset Password</label>
            <input
              type="password"
              className="modal-input"
              placeholder="Enter new password"
              value={editingUser.new_password}
              onChange={(e) =>
                setEditingUser({
                  ...editingUser,
                  new_password: e.target.value,
                })
              }
            />

            <div className="modal-actions">
              <button className="save-btn" onClick={saveProfile}>
                Save
              </button>
              <button className="close-btn" onClick={closeProfile}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
