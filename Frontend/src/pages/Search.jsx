import React, { useState, useEffect } from "react";
import { authFetch } from "../auth";
import { endpoints } from "../api";
import { useNavigate } from "react-router-dom";
import "../styles/Search.css";
import { MdSearch, MdMic } from "react-icons/md";

export default function Search() {
  const [q, setQ] = useState("");
  const [purchaser, setPurchaser] = useState("");
  const [seller, setSeller] = useState("");
  const [docname, setDocname] = useState("");
  const [docno, setDocno] = useState("");
  const [registrationdate, setRegistrationdate] = useState("");
  const [propertyDesc, setPropertyDesc] = useState("");
  
  const [tableName, setTableName] = useState("");
  const [recentTable, setRecentTable] = useState(
  localStorage.getItem("recentTable") || ""
);
   // 🆕 TABLE NAME FILTER
  const [exact, setExact] = useState(false);

  const [rows, setRows] = useState([]);
  const [selectedMap, setSelectedMap] = useState(new Map());
  const [status, setStatus] = useState("");
  
  // Pagination
  const [page, setPage] = useState(1);
  const [perPage] = useState(100);
  const [total, setTotal] = useState(0);
  const [shouldSearch, setShouldSearch] = useState(false);

  const [tableList, setTableList] = useState([]);
  // 🆕 Show recent table first
  const orderedTables = recentTable
  ? [recentTable, ...tableList.filter((t) => t !== recentTable)]
  : tableList;


  const [showTopBtn, setShowTopBtn] = useState(false);
  const navigate = useNavigate();

  
useEffect(() => {
  async function loadTables() {
    const res = await authFetch(endpoints.tables);
    const j = await res.json();
    setTableList(j.tables || []);
  }
  loadTables();
}, []);

useEffect(() => {
  if (recentTable) {
    setTableName(recentTable);  
  }
}, [recentTable]);


  // Scroll button
  useEffect(() => {
    function onScroll() {
      setShowTopBtn(window.scrollY > 400);
    }
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function voiceSearch() {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Voice Search not supported");
      return;
    }
    const rec = new window.webkitSpeechRecognition();
    rec.lang = "en-IN";
    rec.start();
    rec.onresult = (e) => setQ(e.results[0][0].transcript);
  }

  // Highlight matching text safely
  function highlight(text) {
    if (!text) return text;
    const searchWords = [q, purchaser, seller, docname, docno]
      .filter((x) => x && x.trim() !== "");

    if (searchWords.length === 0) return text;

    let result = text;
    searchWords.forEach((word) => {
      const regex = new RegExp(`(${word})`, "gi");
      result = result.replace(regex, "<mark>$1</mark>");
    });

    return result;
  }
function handleTableChange(e) {
  const value = e.target.value;
  setTableName(value);

  // Sync Table Name input
  setTableName(value);

  if (value) {
    setRecentTable(value);
    localStorage.setItem("recentTable", value);
  }
}


  // RUN SEARCH
  async function handleSearch(e) {
  if (e) {
    e.preventDefault();
        setPage(1);
    setShouldSearch(true); // User clicked search
  }

  if (!shouldSearch) {
    setRows([]);
    setStatus("");
    return; 
  }

    const params = new URLSearchParams();
    if (q) params.append("q", q);
    if (purchaser) params.append("purchaser", purchaser);
    if (seller) params.append("seller", seller);
    if (docname) params.append("docname", docname);
    if (docno) params.append("docno", docno);
    if (registrationdate) params.append("registrationdate", registrationdate);
    if (tableName) params.append("table_name", tableName);   // 🆕 SEND TABLE NAME
    if (propertyDesc) params.append("propertydescription", propertyDesc);

    if (exact) params.append("exact", 1);

    params.append("page", page);
    params.append("per_page", perPage);

    const res = await authFetch(`${endpoints.search}?${params.toString()}`, {
      method: "GET",
    });

    const j = await res.json();
    setRows(j.results || []);
    setTotal(j.total || 0);
    setStatus(`Showing ${j.results?.length || 0} of ${j.total || 0} results`);
  }

useEffect(() => {
  if (shouldSearch) handleSearch();
  // eslint-disable-next-line
}, [page]);

  function toggleSelect(id, row) {
    const m = new Map(selectedMap);
    m.has(String(id)) ? m.delete(String(id)) : m.set(String(id), row);
    setSelectedMap(m);
  }

  async function saveSelectedAndGotoSelected() {
    if (!selectedMap.size) return alert("No entries selected.");
    const ids = Array.from(selectedMap.keys()).map((k) => Number(k));

    await authFetch(endpoints.saveSelected, {
      method: "POST",
      body: { entries: ids.map((x) => ({ id: x })) },
    });

    navigate("/selected");
  }

  return (
    <div className="search-container">

      <div className="search-header">
        <h2>Advanced Document Search</h2>
        <p>Search SRO Document Records Instantly</p>
      </div>

      {/* SEARCH FORM */}
      
      <form className="search-box" onSubmit={handleSearch}>
        <div className="form-group">
          <label>Select Table</label>
          <select value={tableName} onChange={handleTableChange}>
            
            <option value="">
              { "-- All Tables --"}
            </option>

            {orderedTables.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

        </div>

        {/* 🆕 TABLE NAME INPUT */}
        <div className="form-group">
          <label>Table Name </label>
          <input
            type="text"
            placeholder="search with table name"
            value={tableName}
            onChange={(e) => setTableName(e.target.value)}
          />
        </div>

        

        <div className="form-group">
          <label>Free Text Search</label>
          <div className="input-with-btn">
            <input type="text" value={q} onChange={(e) => setQ(e.target.value)} />
            <button type="button" className="mic-btn" onClick={voiceSearch}>
              <MdMic size={20} />
            </button>
          </div>
        </div>

        <div className="form-group">
          <label>Property Description</label>
          <input
            type="text"
            value={propertyDesc}
            onChange={(e) => setPropertyDesc(e.target.value)}
            placeholder="Enter property description"
          />
        </div>

        <div className="form-group">
          <label>Purchaser Name</label>
          <input type="text" value={purchaser} onChange={(e) => setPurchaser(e.target.value)} />
        </div>

        <div className="form-group">
          <label>Seller Name</label>
          <input type="text" value={seller} onChange={(e) => setSeller(e.target.value)} />
        </div>

        <div className="form-group">
          <label>Document Name</label>
          <input type="text" value={docname} onChange={(e) => setDocname(e.target.value)} />
        </div>

        <div className="form-group">
          <label>Document Number</label>
          <input type="text" value={docno} onChange={(e) => setDocno(e.target.value)} />
        </div>

        <div className="form-group">
          <label>Registration Date</label>
          <input type="date" value={registrationdate} onChange={(e) => setRegistrationdate(e.target.value)} />
        </div>

        <div className="form-group checkbox-row">
          <div className="exact-box">
            <input type="checkbox" checked={exact} onChange={(e) => setExact(e.target.checked)} id="exactMatch" />
            <label htmlFor="exactMatch">Exact Match</label>
          </div>
        </div>

        <button type="submit" className="search-btn">
          {/* <MdSearch size={30} /> */}Search
        </button>
      </form>

      
      {selectedMap.size > 0 && (
        <div className="selected-footer">
          <button className="selected-btn" onClick={saveSelectedAndGotoSelected}>
            View Selected Entries ({selectedMap.size})
          </button>
        </div>
      )}

      {/* TABLE */}
      <div className="results-area">
        {/* STATUS */}
      <div className="status">{status}</div>

        {rows.length === 0 ? (
          <p>No results.</p>
        ) : (
          <table className="results-table no-context">
            <thead>
              <tr>
                <th>Doc No</th>
                <th>Doc Name</th>
                <th>Reg Date</th>
                <th>SRO</th>
                <th>Seller</th>
                <th>Purchaser</th>
                <th>Property Description</th>
                <th>Area</th>
                <th>Amount</th>
              </tr>
            </thead>

            <tbody>
              {rows.map((r) => {
                const isSelected = selectedMap.has(String(r.id));
                return (
                  <tr
                    key={r.id}
                    className={isSelected ? "row-selected" : ""}
                    onDoubleClick={() => toggleSelect(r.id, r)}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      toggleSelect(r.id, r);
                    }}
                  >
                    <td dangerouslySetInnerHTML={{ __html: highlight(r.docno) }} />
                    <td dangerouslySetInnerHTML={{ __html: highlight(r.docname) }} />
                    <td>{r.registrationdate}</td>
                    <td>{r.sroname}</td>
                    <td dangerouslySetInnerHTML={{ __html: highlight(r.sellerparty) }} />
                    <td dangerouslySetInnerHTML={{ __html: highlight(r.purchaserparty) }} />
                    <td dangerouslySetInnerHTML={{ __html: highlight(r.propertydescription) }} />
                    <td dangerouslySetInnerHTML={{ __html: highlight(r.areaname) }} />
                    <td>{r.consideration_amt}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* PAGE controls */}
      {total > 0 && (
        <div className="pagination-controls">
          <button disabled={page === 1} onClick={() => setPage(page - 1)}>⬅ Previous</button>
          <span>Page {page}</span>
          <button disabled={page * perPage >= total} onClick={() => setPage(page + 1)}>Next ➡</button>
        </div>
      )}

      {showTopBtn && (
        <button
          className="top-btn"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          ⬆ Back to Top
        </button>
      )}
    </div>
  );
}
