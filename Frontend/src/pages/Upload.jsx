import React, { useState, useRef } from "react";
import { authFetch } from "../auth";
import { endpoints } from "../api";
import "../styles/upload.css";

export default function Upload() {
  const [status, setStatus] = useState("");
  const [dragging, setDragging] = useState(false);
  const [tableName, setTableName] = useState("");
  const fileInputRef = useRef(null);

  async function uploadFiles(fileList) {
    const files = Array.from(fileList);

    if (!tableName.trim()) {
      alert("Please enter a table name before uploading.");
      return;
    }

    if (files.length === 0) return;

    setStatus(`Uploading ${files.length} file(s) to table: ${tableName} ...`);

    const fd = new FormData();
    fd.append("table_name", tableName.trim());
    files.forEach((file) => fd.append("files", file));

    const res = await authFetch(endpoints.upload, {
      method: "POST",
      body: fd,
    });

    const j = await res.json();

    if (res.ok) {
      setStatus(`Upload successful into table: ${tableName}`);
    } else {
      setStatus("Upload failed: " + (j.error || j.message));
    }
  }

  function handleFileSelect(e) {
    uploadFiles(e.target.files);
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragging(false);
    uploadFiles(e.dataTransfer.files);
  }

  return (
    <div className="upload-page">
      <div className="upload-wrapper">
        <h1 className="upload-title">
          <span className="upload-icon">💠</span> Upload Your .XLS Files
        </h1>

        {/* NEW INPUT FIELD */}
        <div className="table-name-box">
          <label>Save As Table Name</label>
          <input
            type="text"
            placeholder="Enter table name before upload"
            value={tableName}
            onChange={(e) => setTableName(e.target.value)}
            className="table-input"
          />
        </div>

        <div
          className={`drop-area ${dragging ? "drag-over" : ""}`}
          onClick={() => fileInputRef.current.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".xls,.xlsx,.csv"
            className="file-input"
            onChange={handleFileSelect}
          />

          <p className="drag-title">Drag & Drop your files here</p>
          <p className="browse-text">
            or <span className="browse-link">click to browse files</span>
          </p>
        </div>

        <p className="upload-status">{status}</p>
      </div>
    </div>
  );
}
