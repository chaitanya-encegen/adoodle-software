import React, { useEffect, useState } from "react";
import { authFetch } from "../auth";
import { endpoints } from "../api";
import "../styles/Selected.css";

import { MdFolder,MdFolderSpecial, MdEmail } from "react-icons/md";
import { FaRegCopy, FaFileExcel, FaFileWord } from "react-icons/fa";
import { IoArrowBackOutline } from "react-icons/io5";

export default function Selected() {
  const [groups, setGroups] = useState([]);
  const [active, setActive] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    loadSelected();
  }, []);

  function showToast(text, type = "info", ms = 3000) {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, text, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), ms);
  }

  async function loadSelected() {
    setLoading(true);
    try {
      const res = await authFetch(endpoints.selectedRows, { method: "POST", body: {} });
      const j = await res.json();
      setGroups(j.groups || []);
    } catch {
      showToast("Failed to load selected entries", "error");
      setGroups([]);
    }
    setLoading(false);
  }

  // ========== CHIP TOGGLE ==========
  function handleChipClick(table_name) {
    if (active === table_name) {
      // re-click closes table
      setActive(null);
    } else {
      setActive(table_name);
    }
  }

  async function handleRemoveGroup(table_name) {
    if (!window.confirm(`Remove all entries for ${table_name}?`)) return;
    try {
      await authFetch(endpoints.removeSelectedGroup, {
        method: "POST",
        body: { table_name },
      });

      setGroups((g) => g.filter((x) => x.table_name !== table_name));

      if (active === table_name) setActive(null);

      showToast("Group removed", "success");
    } catch {
      showToast("Failed to remove group", "error");
    }
  }

  async function handleRemoveRow(sel_id, table_name) {
    if (!window.confirm("Remove this entry?")) return;
    try {
      const res = await authFetch(endpoints.removeSelected, {
        method: "POST",
        body: { id: sel_id },
      });
      const j = await res.json();
      if (!j.deleted) return;

      setGroups((prev) =>
        prev
          .map((g) =>
            g.table_name === table_name
              ? { ...g, rows: g.rows.filter((r) => r.sel_id !== sel_id) }
              : g
          )
          .filter((g) => g.rows.length > 0)
      );

      showToast("Entry removed", "success");
    } catch {}
  }

  function copyAll(rows) {
    if (!rows?.length) return showToast("No entries to copy");
    const text = rows.map((r) => `${r.docno || ""} | ${r.docname || ""}`).join("\n");
    navigator.clipboard.writeText(text);
    showToast("Copied", "success");
  }

  async function exportTo(rows, endpoint, filename) {
    if (!rows?.length) return showToast("No entries to export");

   const payload = { entries: rows.map((r) => ({ id: r.document_id })) };

    const res = await authFetch(endpoint, { method: "POST", body: payload });

    const blob = await res.blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();

    showToast("Download complete", "success");
  }

  async function emailEntries(rows) {
    if (!rows?.length) return showToast("No entries to email");

    const email = window.prompt("Enter target email:");
    if (!email) return;

    const payload = { email, attach_excel: true, entries: rows.map((r) => ({ id: r.sel_id })) };
    await authFetch(endpoints.emailSelected, { method: "POST", body: payload });

    showToast("Email sent", "success");
  }

  const activeGroup = groups.find((g) => g.table_name === active);

  return (
    <div className="selected-page">
       <div className="heading"><h1>Data Explorer</h1></div>
      {/* TITLE */}
      <div className="chip-header">
        <span className="chip-title"> <MdFolderSpecial size={16} /> {groups.length} Tables Available</span>
      </div>

      {/* CHIPS */}
      <div className="chip-container">
        {groups.map((g) => (
          <div
            key={g.table_name}
            className={`chip-item ${active === g.table_name ? "active-chip" : ""}`}
            onClick={() => handleChipClick(g.table_name)}
          >
            <MdFolderSpecial size={16} />
            {g.chip_label}
            <span className="chip-count">{g.rows.length}</span>

            <span
              className="chip-remove"
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveGroup(g.table_name);
              }}
            >
              ×
            </span>
          </div>
        ))}
      </div>

      {/* ACTION BUTTONS — ALWAYS VISIBLE */}
      <div className="actions-row-top">
        <button
          className="btn-white"
          disabled={!activeGroup}
          onClick={() => activeGroup && copyAll(activeGroup.rows)}
        >
          <FaRegCopy size={15} /> Copy All
        </button>

        <button
          className="btn-excel"
          disabled={!activeGroup}
          onClick={() =>
            activeGroup && exportTo(activeGroup.rows, endpoints.exportExcel, "selected.xlsx")
          }
        >
          <FaFileExcel size={15} /> Export to Excel
        </button>

        <button
          className="btn-word"
          disabled={!activeGroup}
          onClick={() =>
            activeGroup && exportTo(activeGroup.rows, endpoints.exportWord, "selected.docx")
          }
        >
          <FaFileWord size={15} /> Export to Word
        </button>

        <button
          className="btn-email"
          disabled={!activeGroup}
          onClick={() => activeGroup && emailEntries(activeGroup.rows)}
        >
          <MdEmail size={15} /> Email Entries
        </button>
      </div>

      {/* TABLE WRAPPER (ALWAYS PRESENT) */}
      <div className="table-wrap">

        {/* TABLE HEADER ALWAYS VISIBLE */}
        <table className="selected-table">
          <thead>
            <tr>
              <th>Action</th>
              {/* <th>Date of Execution</th> */}
              <th>Doc No</th>
              <th>Doc Name</th>
              <th>Registration Date</th>
              <th>SRO Name</th>
              <th>Seller Party</th>
              <th>Purchaser Party</th>
              <th>Property Description</th>
              <th>Area Name</th>
              <th>Consideration Amount</th>
            </tr>
          </thead>

          <tbody>
            {/* EMPTY STATE */}
            {!activeGroup && (
              <tr>
                <td colSpan="11">
                  <div className="empty-state">
                    <div className="empty-icon">🗄️</div>
                    <div className="empty-state-title">No Data Available</div>
                    <div className="empty-state-sub">
                      Select a table from above to view its entries
                    </div>
                  </div>
                </td>
              </tr>
            )}

            {/* SHOW ROWS */}
            {activeGroup &&
              activeGroup.rows.map((r) => (
                <tr key={r.sel_id}>
                  <td>
                    <button
                      className="delete-action"
                      onClick={() => handleRemoveRow(r.sel_id, activeGroup.table_name)}
                    >
                      Delete
                    </button>
                  </td>
                  {/* <td>{r.dateofexecution}</td> */}
                  <td>{r.docno}</td>
                  <td>{r.docname}</td>
                  <td>{r.registrationdate}</td>
                  <td>{r.sroname}</td>
                  <td>{r.sellerparty}</td>
                  <td>{r.purchaserparty}</td>
                  <td className="prop-col">
                    <div className="prop-text">{r.propertydescription}</div>
                  </td>
                  <td>{r.areaname}</td>
                  <td className="amount-col">{r.consideration_amt}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* BACK BUTTON */}
      <a href="/search" className="back-btn">
        <IoArrowBackOutline /> Back to search
      </a>

      {/* TOASTS */}
      <div className="toast-wrap">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            {t.text}
          </div>
        ))}
      </div>
    </div>
  );
}
