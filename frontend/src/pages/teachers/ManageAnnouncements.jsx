import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import "./CSS/ManageAnnouncements.css";

const API_BASE = "http://localhost:8000";
const DESC_LIMIT = 160;

const emptyForm = {
  title:       "",
  description: "",
};

export default function ManageAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [teachers, setTeachers]           = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState(null);
  const [expanded, setExpanded]           = useState({});

  const [filters, setFilters] = useState({
    search:     "",
    created_by: "",
    start_date: "",
    end_date:   "",
  });

  const [modal, setModal]           = useState(null);
  const [selected, setSelected]     = useState(null);
  const [form, setForm]             = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast]           = useState(null);

  // ── Fetch announcements ─────────────────────────────────────────
  const fetchAnnouncements = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters.search)     params.append("search",     filters.search);
      if (filters.created_by) params.append("created_by", filters.created_by);
      if (filters.start_date) params.append("start_date", filters.start_date);
      if (filters.end_date)   params.append("end_date",   filters.end_date);

      const res  = await fetch(`${API_BASE}/announcements/info/?${params}`);
      const data = await res.json();
      setAnnouncements(data);
    } catch {
      setError("Failed to load announcements. Is the server running?");
    } finally {
      setLoading(false);
    }
  };

  // ── Fetch teachers for filter dropdown ─────────────────────────
  const fetchTeachers = async () => {
    try {
      const res  = await fetch(`${API_BASE}/announcements/teachers/`);
      const data = await res.json();
      setTeachers(data);
    } catch {
      // non-fatal
    }
  };

  useEffect(() => { fetchTeachers(); }, []);
  useEffect(() => { fetchAnnouncements(); }, [filters]);

  // ── Toast ───────────────────────────────────────────────────────
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Modals ──────────────────────────────────────────────────────
  const openCreate = () => {
    setForm(emptyForm);
    setFormErrors({});
    setModal("create");
  };

  const openEdit = (ann) => {
    setSelected(ann);
    setForm({ title: ann.title, description: ann.description });
    setFormErrors({});
    setModal("edit");
  };

  const openDelete = (ann) => {
    setSelected(ann);
    setModal("delete");
  };

  const closeModal = () => {
    setModal(null);
    setSelected(null);
    setForm(emptyForm);
    setFormErrors({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    setFormErrors((p) => ({ ...p, [name]: null }));
  };

  const toggleExpand = (id) => {
    setExpanded((p) => ({ ...p, [id]: !p[id] }));
  };

  // ── CREATE ──────────────────────────────────────────────────────
  const handleCreate = async () => {
    setSubmitting(true);
    try {
      const res  = await fetch(`${API_BASE}/announcements/info/`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message || "Announcement created.");
        closeModal();
        fetchAnnouncements();
      } else {
        setFormErrors(data);
      }
    } catch {
      showToast("Network error. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // ── EDIT ────────────────────────────────────────────────────────
  const handleEdit = async () => {
    setSubmitting(true);
    try {
      const res  = await fetch(`${API_BASE}/announcements/info/${selected.id}/`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        showToast("Announcement updated successfully.");
        closeModal();
        fetchAnnouncements();
      } else {
        setFormErrors(data);
      }
    } catch {
      showToast("Network error. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // ── DELETE ──────────────────────────────────────────────────────
  const handleDelete = async () => {
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/announcements/info/${selected.id}/`, {
        method: "DELETE",
      });
      if (res.ok) {
        showToast("Announcement deleted.");
        closeModal();
        fetchAnnouncements();
      } else {
        showToast("Failed to delete.", "error");
      }
    } catch {
      showToast("Network error. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Helpers ─────────────────────────────────────────────────────
  const formatDate = (dt) => {
    if (!dt) return "--";
    return new Date(dt).toLocaleDateString("en-US", {
      year: "numeric", month: "short", day: "numeric",
    });
  };

  const formatTime = (dt) => {
    if (!dt) return "";
    return new Date(dt).toLocaleTimeString("en-US", {
      hour: "2-digit", minute: "2-digit",
    });
  };

  const getCreatedBy = (ann) => {
    if (!ann.created_by) return "--";
    const { first_name, last_name, username } = ann.created_by;
    if (first_name || last_name) return `${first_name} ${last_name}`.trim();
    return username;
  };

  // ── Render ───────────────────────────────────────────────────────
  return (
    <div className="teacher-layout">
      <Sidebar />

      <div className="teacher-layout__content">

        {/* Toast */}
        {toast && (
          <div className={`ma-toast ma-toast--${toast.type}`}>
            {toast.type === "success"
              ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5"/></svg>
              : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            }
            {toast.message}
          </div>
        )}

        {/* Header */}
        <div className="ma-header">
          <div>
            <h1 className="ma-title">Manage Announcements</h1>
            <p className="ma-subtitle">
              {loading ? "Loading..." : `${announcements.length} announcement${announcements.length !== 1 ? "s" : ""} found`}
            </p>
          </div>
          <button className="ma-btn ma-btn--primary" onClick={openCreate}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            New Announcement
          </button>
        </div>

        {/* Filters */}
        <div className="ma-filters">
          <div className="ma-search-wrap">
            <svg className="ma-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              className="ma-input ma-search"
              placeholder="Search by title…"
              value={filters.search}
              onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value }))}
            />
          </div>

          <select
            className="ma-input ma-select"
            value={filters.created_by}
            onChange={(e) => setFilters((p) => ({ ...p, created_by: e.target.value }))}
          >
            <option value="">All Teachers</option>
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.first_name || t.last_name
                  ? `${t.first_name} ${t.last_name}`.trim()
                  : t.username}
              </option>
            ))}
          </select>

          <div className="ma-date-range">
            <input
              className="ma-input ma-date"
              type="date"
              value={filters.start_date}
              onChange={(e) => setFilters((p) => ({ ...p, start_date: e.target.value }))}
            />
            <span className="ma-date-sep">to</span>
            <input
              className="ma-input ma-date"
              type="date"
              value={filters.end_date}
              onChange={(e) => setFilters((p) => ({ ...p, end_date: e.target.value }))}
            />
          </div>

          {(filters.search || filters.created_by || filters.start_date || filters.end_date) && (
            <button
              className="ma-btn ma-btn--ghost"
              onClick={() => setFilters({ search: "", created_by: "", start_date: "", end_date: "" })}
            >
              Clear
            </button>
          )}
        </div>

        {/* List */}
        <div className="ma-list">
          {error ? (
            <div className="ma-empty ma-empty--error">{error}</div>
          ) : loading ? (
            <div className="ma-empty">
              <div className="ma-spinner" />
              Loading announcements…
            </div>
          ) : announcements.length === 0 ? (
            <div className="ma-empty">No announcements found.</div>
          ) : (
            announcements.map((ann) => {
              const isExpanded = expanded[ann.id];
              const isLong     = ann.description.length > DESC_LIMIT;
              const displayDesc = isExpanded || !isLong
                ? ann.description
                : ann.description.slice(0, DESC_LIMIT) + "…";

              return (
                <div key={ann.id} className="ma-card">
                  {/* Top 40% — meta info */}
                  <div className="ma-card__top">
                    <div className="ma-card__meta">
                      <h3 className="ma-card__title">{ann.title}</h3>
                      <div className="ma-card__info">
                        <span className="ma-info-item">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                            <circle cx="12" cy="7" r="4"/>
                          </svg>
                          {getCreatedBy(ann)}
                        </span>
                        <span className="ma-info-item">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                            <line x1="16" y1="2" x2="16" y2="6"/>
                            <line x1="8"  y1="2" x2="8"  y2="6"/>
                            <line x1="3"  y1="10" x2="21" y2="10"/>
                          </svg>
                          {formatDate(ann.upload_time)} · {formatTime(ann.upload_time)}
                        </span>
                        {ann.updated_time !== ann.upload_time && (
                          <span className="ma-badge ma-badge--edited">edited</span>
                        )}
                      </div>
                    </div>
                    <div className="ma-card__actions">
                      <button className="ma-icon-btn ma-icon-btn--edit" onClick={() => openEdit(ann)} title="Edit">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                      </button>
                      <button className="ma-icon-btn ma-icon-btn--delete" onClick={() => openDelete(ann)} title="Delete">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                          <path d="M10 11v6M14 11v6"/>
                          <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="ma-card__divider" />

                  {/* Bottom 60% — description */}
                  <div className="ma-card__bottom">
                    <p className="ma-card__desc">{displayDesc}</p>
                    {isLong && (
                      <button
                        className="ma-see-more"
                        onClick={() => toggleExpand(ann.id)}
                      >
                        {isExpanded ? "See less" : "See more"}
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                          style={{ transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)" }}>
                          <polyline points="6 9 12 15 18 9"/>
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ── CREATE / EDIT MODAL ───────────────────────────────────── */}
      {(modal === "create" || modal === "edit") && (
        <div className="ma-overlay" onClick={closeModal}>
          <div className="ma-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ma-modal__header">
              <h2>{modal === "create" ? "New Announcement" : "Edit Announcement"}</h2>
              <button className="ma-modal__close" onClick={closeModal}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <div className="ma-modal__body">
              <div className="ma-field">
                <label>Title</label>
                <input
                  className={`ma-input ${formErrors.title ? "ma-input--error" : ""}`}
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Announcement title…"
                />
                {formErrors.title && (
                  <span className="ma-error">
                    {Array.isArray(formErrors.title) ? formErrors.title[0] : formErrors.title}
                  </span>
                )}
              </div>

              <div className="ma-field">
                <label>Description</label>
                <textarea
                  className={`ma-input ma-textarea ${formErrors.description ? "ma-input--error" : ""}`}
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Write the announcement details…"
                  rows={6}
                />
                {formErrors.description && (
                  <span className="ma-error">
                    {Array.isArray(formErrors.description) ? formErrors.description[0] : formErrors.description}
                  </span>
                )}
              </div>
            </div>

            <div className="ma-modal__footer">
              <button className="ma-btn ma-btn--ghost" onClick={closeModal} disabled={submitting}>Cancel</button>
              <button
                className="ma-btn ma-btn--primary"
                onClick={modal === "create" ? handleCreate : handleEdit}
                disabled={submitting}
              >
                {submitting && <span className="ma-spinner ma-spinner--sm" />}
                {modal === "create" ? "Publish" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE MODAL ─────────────────────────────────────────── */}
      {modal === "delete" && selected && (
        <div className="ma-overlay" onClick={closeModal}>
          <div className="ma-modal ma-modal--sm" onClick={(e) => e.stopPropagation()}>
            <div className="ma-modal__header">
              <h2>Delete Announcement</h2>
              <button className="ma-modal__close" onClick={closeModal}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className="ma-modal__body">
              <div className="ma-delete-warn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              </div>
              <p className="ma-delete-text">
                Are you sure you want to delete <strong>"{selected.title}"</strong>?
                <br />
                <span className="ma-muted">This action cannot be undone.</span>
              </p>
            </div>
            <div className="ma-modal__footer">
              <button className="ma-btn ma-btn--ghost" onClick={closeModal} disabled={submitting}>Cancel</button>
              <button className="ma-btn ma-btn--danger" onClick={handleDelete} disabled={submitting}>
                {submitting && <span className="ma-spinner ma-spinner--sm" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}