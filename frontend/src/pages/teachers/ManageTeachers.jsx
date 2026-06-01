import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import "./CSS/ManageTeachers.css";
import { useAuth } from "../../context/authcontext";
const API_BASE = "http://localhost:8000";

export default function ManageTeachers() {
  const navigate = useNavigate();
  const { accessToken } = useAuth();
  const [teachers,    setTeachers]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [search,      setSearch]      = useState("");
  const [modalOpen,   setModalOpen]   = useState(false);
  const [deleteModal, setDeleteModal] = useState(null);
  const [editTarget,  setEditTarget]  = useState(null);
  const [saving,      setSaving]      = useState(false);
  const [formError,   setFormError]   = useState(null);
  const guardRes = (res) => {
  if (res.status === 403) { navigate("/unauthorized"); return false; }
  return true;
};

  const [form, setForm] = useState({
    username: "", first_name: "", last_name: "",
    email: "", phone: "", password: "",
  });

  // ── fetch ─────────────────────────────────────────────────────────────────
  const fetchTeachers = async () => {
    setLoading(true); setError(null);
    try {
      const res  = await fetch(`${API_BASE}/teachers/teachers/`, {
        headers: { "Authorization": `Bearer ${accessToken}` }
      });
      if (!guardRes(res)) return;
      const data = await res.json();
      setTeachers(data);
    } catch { setError("Failed to load teachers."); }
    finally  { setLoading(false); }
  };

  useEffect(() => { if (!accessToken) return; fetchTeachers(); }, [accessToken]);

  // ── filter ────────────────────────────────────────────────────────────────
  const filtered = teachers.filter(t => {
    const q = search.toLowerCase();
    return (
      t.username?.toLowerCase().includes(q)   ||
      t.first_name?.toLowerCase().includes(q) ||
      t.last_name?.toLowerCase().includes(q)  ||
      t.email?.toLowerCase().includes(q)
    );
  });

  // ── modal helpers ─────────────────────────────────────────────────────────
  const openAdd = () => {
    setEditTarget(null);
    setForm({ username: "", first_name: "", last_name: "", email: "", phone: "", password: "" });
    setFormError(null);
    setModalOpen(true);
  };

  const openEdit = (t) => {
    setEditTarget(t);
    setForm({
      username:   t.username   || "",
      first_name: t.first_name || "",
      last_name:  t.last_name  || "",
      email:      t.email      || "",
      phone:      t.phone      || "",
      password:   "",
    });
    setFormError(null);
    setModalOpen(true);
  };

  const closeModal = () => { setModalOpen(false); setEditTarget(null); setFormError(null); };

  const handleSave = async () => {
  setSaving(true); setFormError(null);
  try {
    const url    = editTarget
      ? `${API_BASE}/teachers/teachers/${editTarget.id}/`
      : `${API_BASE}/teachers/teachers/`;
    const method = editTarget ? "PUT" : "POST";
    const res    = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" , "Authorization": `Bearer ${accessToken}`,},
      body:    JSON.stringify(form),
    });
    if (!guardRes(res)) return;
    const data = await res.json();
    if (!res.ok) {
      const first = Object.values(data)[0];
      setFormError(Array.isArray(first) ? first[0] : first || "Something went wrong.");
      return;
    }
    await fetchTeachers();
    closeModal();
  } catch { setFormError("Network error. Please try again."); }
  finally  { setSaving(false); }
};
const handleDelete = async () => {
  if (!deleteModal) return;
  try {
    const res = await fetch(`${API_BASE}/teachers/teachers/${deleteModal.id}/`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${accessToken}` }, // ← missing
    });
    if (!guardRes(res)) return; // ← res now exists
    await fetchTeachers();
  } catch {}
  setDeleteModal(null);
};
  

  const getInitials = (t) => {
    if (t.first_name || t.last_name)
      return `${t.first_name?.[0] || ""}${t.last_name?.[0] || ""}`.toUpperCase();
    return t.username?.[0]?.toUpperCase() || "?";
  };

  const getDisplayName = (t) => {
    if (t.first_name || t.last_name)
      return `${t.first_name || ""} ${t.last_name || ""}`.trim();
    return t.username;
  };

  return (
    <div className="teacher-layout">
      <Sidebar />
      <div className="teacher-layout__content">

        {/* Header */}
        <div className="mt-header">
          <div>
            <h1 className="mt-title">Manage Teachers</h1>
            <p className="mt-subtitle">
              {loading
                ? "Loading..."
                : `${filtered.length} teacher${filtered.length !== 1 ? "s" : ""}`}
            </p>
          </div>
          <button className="mt-btn mt-btn--primary" onClick={openAdd}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="15" height="15">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            New Teacher
          </button>
        </div>

        {/* Search */}
        <div className="mt-filters">
          <div className="mt-search-wrap">
            <svg className="mt-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              className="mt-input mt-search"
              placeholder="Search by name, username or email…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          {search && (
            <button className="mt-btn mt-btn--ghost" onClick={() => setSearch("")}>Clear</button>
          )}
        </div>

        {/* Table */}
        <div className="mt-table-wrap">
          {error ? (
            <div className="mt-empty mt-empty--error">{error}</div>
          ) : loading ? (
            <div className="mt-empty"><div className="mt-spinner"/>Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="mt-empty">No teachers found.</div>
          ) : (
            <table className="mt-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Teacher</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t, idx) => (
                  <tr key={t.id} className="mt-row">
                    <td className="mt-muted">{idx + 1}</td>
                    <td>
                      <div className="mt-person">
                        <div className="mt-avatar">{getInitials(t)}</div>
                        <div>
                          <div className="mt-name">{getDisplayName(t)}</div>
                          <span className="mt-role-badge">Teacher</span>
                        </div>
                      </div>
                    </td>
                    <td className="mt-muted">{t.username}</td>
                    <td className="mt-muted">{t.email || <span className="mt-na">—</span>}</td>
                    <td className="mt-muted">{t.phone || <span className="mt-na">—</span>}</td>
                    <td className="mt-actions">
                      <button className="mt-icon-btn mt-icon-btn--edit"
                        onClick={() => openEdit(t)} title="Edit">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                      </button>
                      <button className="mt-icon-btn mt-icon-btn--delete"
                        onClick={() => setDeleteModal(t)} title="Delete">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                          <path d="M10 11v6"/><path d="M14 11v6"/>
                          <path d="M9 6V4h6v2"/>
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="mt-overlay" onClick={closeModal}>
          <div className="mt-modal" onClick={e => e.stopPropagation()}>
            <div className="mt-modal__header">
              <h2 className="mt-modal__title">
                {editTarget ? "Edit Teacher" : "New Teacher"}
              </h2>
              <button className="mt-modal__close" onClick={closeModal}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="18" height="18">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            {formError && <div className="mt-form-error">{formError}</div>}

            <div className="mt-form-grid">
              <div className="mt-form-group mt-form-group--full">
                <label className="mt-label">Username <span className="mt-req">*</span></label>
                <input className="mt-input" placeholder="e.g. jsmith"
                  value={form.username}
                  onChange={e => setForm(p => ({ ...p, username: e.target.value }))} />
              </div>

              <div className="mt-form-group">
                <label className="mt-label">First Name</label>
                <input className="mt-input" placeholder="John"
                  value={form.first_name}
                  onChange={e => setForm(p => ({ ...p, first_name: e.target.value }))} />
              </div>

              <div className="mt-form-group">
                <label className="mt-label">Last Name</label>
                <input className="mt-input" placeholder="Smith"
                  value={form.last_name}
                  onChange={e => setForm(p => ({ ...p, last_name: e.target.value }))} />
              </div>

              <div className="mt-form-group">
                <label className="mt-label">Email</label>
                <input className="mt-input" type="email" placeholder="john@school.edu"
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
              </div>

              <div className="mt-form-group">
                <label className="mt-label">Phone</label>
                <input className="mt-input" placeholder="10-digit number"
                  value={form.phone}
                  onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
              </div>

              <div className="mt-form-group mt-form-group--full">
                <label className="mt-label">
                  Password {!editTarget && <span className="mt-req">*</span>}
                  {editTarget && <span className="mt-label-hint"> — leave blank to keep current</span>}
                </label>
                <input className="mt-input" type="password"
                  placeholder={editTarget ? "Leave blank to keep current" : "Min 6 characters"}
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))} />
              </div>
            </div>

            <div className="mt-modal__footer">
              <button className="mt-btn mt-btn--ghost" onClick={closeModal}>Cancel</button>
              <button className="mt-btn mt-btn--primary" onClick={handleSave} disabled={saving}>
                {saving ? "Saving…" : editTarget ? "Save Changes" : "Create Teacher"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteModal && (
        <div className="mt-overlay" onClick={() => setDeleteModal(null)}>
          <div className="mt-modal mt-modal--sm" onClick={e => e.stopPropagation()}>
            <div className="mt-modal__header">
              <h2 className="mt-modal__title">Delete Teacher</h2>
            </div>
            <p className="mt-modal__body">
              Delete <strong>{getDisplayName(deleteModal)}</strong>? This will permanently
              remove their account and all associated data.
            </p>
            <div className="mt-modal__footer">
              <button className="mt-btn mt-btn--ghost" onClick={() => setDeleteModal(null)}>Cancel</button>
              <button className="mt-btn mt-btn--danger" onClick={handleDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}