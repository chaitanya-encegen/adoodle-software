import { useState } from "react";
import axios from "axios";
import "../styles/ForgotPassword.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await axios.post("http://localhost:5000/forgot-password", { email });

      if (res.data.reset_token) {
        setMessage(
          `Reset Link (dev): http://localhost:5173/reset-password?token=${res.data.reset_token}`
        );
      } else {
        setMessage(res.data.message);
      }
    } catch (err) {
      setMessage("Error sending reset link.");
    }

    setLoading(false);
  };

  return (
   <div className="forgot-wrapper">
  <div className="forgot-card">
    <h2 className="forgot-title">Forgot Password</h2>

    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="forgot-label">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="forgot-input"
        />
      </div>

      <button type="submit" disabled={loading} className="forgot-btn">
        {loading ? "Sending..." : "Send Reset Link"}
      </button>

      {message && <p className="forgot-message">{message}</p>}
    </form>
  </div>
</div>

  );
}
