import { useState } from "react";
import axios from "axios";
import { useSearchParams, useNavigate } from "react-router-dom";
import "../styles/ResetPassword.css";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsError(false);

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      setIsError(true);
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/reset-password", {
        token,
        new_password: password,
      });

      setMessage(res.data.message || "Password reset successful.");
      setIsError(false);

      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setMessage(err.response?.data?.error || "Invalid or expired reset link.");
      setIsError(true);
    }

    setLoading(false);
  };

  return (
   <div className="reset-wrapper">
  <div className="reset-card">
    <h2 className="reset-title">Reset Password</h2>

    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="reset-label">New Password</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="reset-input"
        />
      </div>

      <div>
        <label className="reset-label">Confirm Password</label>
        <input
          type="password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="reset-input"
        />
      </div>

      <button type="submit" disabled={loading} className="reset-btn">
        {loading ? "Updating..." : "Update Password"}
      </button>

      {message && (
        <p className={isError ? "reset-message-error" : "reset-message-success"}>
          {message}
        </p>
      )}
    </form>
  </div>
</div>

  );
}
