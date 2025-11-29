// pages/History.jsx
import React, { useEffect, useState } from "react";
import { authFetch } from "../auth";
import { endpoints } from "../api";
import { useNavigate } from "react-router-dom";

export default function History() {
  const [rows, setRows] = useState([]);
  const navigate = useNavigate();

  useEffect(()=>{ loadHistory(); }, []);

  async function loadHistory() {
    const res = await authFetch(endpoints.history + "?limit=100", { method: "GET" });
    const j = await res.json();
    setRows(j.history || []);
  }

  function runParams(params) {
    const qs = new URLSearchParams(params).toString();
    navigate("/search?" + qs);
  }

  return (
    <div className="container">
      <div className="card">
        <h3>Search History</h3>
        {rows.length === 0 ? <p>No history</p> : (
          <table className="table">
            <thead><tr><th>#</th><th>Params</th><th>Time</th><th>Action</th></tr></thead>
            <tbody>
              {rows.map((r,i) => (
                <tr key={r.id}>
                  <td>{i+1}</td>
                  <td><pre style={{whiteSpace:'pre-wrap'}}>{JSON.stringify(r.params, null, 2)}</pre></td>
                  <td>{new Date(r.created_at).toLocaleString()}</td>
                  <td><button className="btn" onClick={()=>runParams(r.params)}>Run</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
