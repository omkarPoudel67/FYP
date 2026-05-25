import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import "./CSS/ManageGroups.css";

const API_BASE = "http://localhost:8000";

export default function ManageGroups() {
  const [groups,        setGroups]        = useState([]);
  const [modules,       setModules]       = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState(null);
  const [search,        setSearch]        = useState("");
  const [modalOpen,     setModalOpen]     = useState(false);
  const [deleteModal,   setDeleteModal]   = useState(null);
  const [studentsModal, setStudentsModal] = useState(null);
  const [editTarget,    setEditTarget]    = useState(null);
  const [saving,        setSaving]        = useState(false);
  const [formError,     setFormError]     = useState(null);
  const [form,          setForm]          = useState({ name: "", module: [] });

  const fetchGroups = async () => {
    setLoading(true); setError(null);
    try {
      const res  = await fetch(`${API_BASE}/schedule/groups/`);
      const data = await res.json();
      setGroups(data);
    } catch { setError("Failed to load groups."); }
    finally  { setLoading(false); }
  };

  const fetchModules = async () => {
    try {
      const res  = await fetch(`${API_BASE}/resources/modules/info/`);
      const data = await res.json();
      setModules(data);
    } catch {}
  };

  useEffect(() => { fetchGroups(); fetchModules(); }, []);

  const filtered = groups.filter(g =>
    g.name.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    setEditTarget(null);
    setForm({ name: "", module: [] });
    setFormError(null);
    setModalOpen(true);
  };

  const openEdit = (e, g) => {
    e.stopPropagation();
    setEditTarget(g);
    setForm({ name: g.name, module: g.modules.map(m => m.id) });
    setFormError(null);
    setModalOpen(true);
  };

  const closeModal = () => { setModalOpen(false); setEditTarget(null); setFormError(null); };

  const toggleModule = id =>
    setForm(p => ({
      ...p,
      module: p.module.includes(id)
        ? p.module.filter(x => x !== id)
        : [...p.module, id],
    }));

  const handleSave = async () => {
    if (!form.name.trim()) { setFormError("Group name is required."); return; }
    setSaving(true); setFormError(null);
    try {
      const url    = editTarget
        ? `${API_BASE}/schedule/groups/${editTarget.id}/`
        : `${API_BASE}/schedule/groups/`;
      const method = editTarget ? "PUT" : "POST";
      const res    = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.name?.[0] || data.detail || "Something went wrong.");
        return;
      }
      await fetchGroups();
      closeModal();
    } catch { setFormError("Network error. Please try again."); }
    finally  { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    try {
      await fetch(`${API_BASE}/schedule/groups/${deleteModal.id}/`, { method: "DELETE" });
      await fetchGroups();
    } catch {}
    setDeleteModal(null);
  };

  return (
    <div className="teacher-layout">
      <Sidebar />
      <div className="teacher-layout__content">

        <div className="mg-header">
          <div>
            <h1 className="mg-title">Manage Groups</h1>
            <p className="mg-subtitle">
              {loading ? "Loading..." : `${filtered.length} group${filtered.length !== 1 ? "s" : ""}`}
            </p>
          </div>
          <button className="mg-btn mg-btn--primary" onClick={openAdd}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="15" height="15">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            New Group
          </button>
        </div>

        <div className="mg-filters">
          <div className="mg-search-wrap">
            <svg className="mg-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input className="mg-input mg-search" placeholder="Search groups…"
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          {search && (
            <button className="mg-btn mg-btn--ghost" onClick={() => setSearch("")}>Clear</button>
          )}
        </div>

        <div className="mg-table-wrap">
          {error ? (
            <div className="mg-empty mg-empty--error">{error}</div>
          ) : loading ? (
            <div className="mg-empty"><div className="mg-spinner"/>Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="mg-empty">No groups found.</div>
          ) : (
            <table className="mg-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Group Name</th>
                  <th>Modules</th>
                  <th>Students</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((g, idx) => (
                  <tr key={g.id} className="mg-row">
                    <td className="mg-muted">{idx + 1}</td>
                    <td><div className="mg-name">{g.name}</div></td>
                    <td>
                      <div className="mg-module-chips">
                        {g.modules?.length > 0
                          ? g.modules.slice(0, 4).map(m => (
                              <span key={m.id} className="mg-badge mg-badge--module">{m.code}</span>
                            ))
                          : <span className="mg-na">—</span>}
                        {g.modules?.length > 4 && (
                          <span className="mg-badge mg-badge--more">+{g.modules.length - 4}</span>
                        )}
                      </div>
                    </td>
                    <td>
                      {g.students?.length > 0 ? (
                        <button className="mg-students-btn" onClick={() => setStudentsModal(g)}>
                          <span className="mg-badge mg-badge--count">{g.students.length}</span>
                          <span className="mg-students-btn__label">View</span>
                        </button>
                      ) : (
                        <span className="mg-na">0 students</span>
                      )}
                    </td>
                    <td className="mg-actions">
                      <button className="mg-icon-btn mg-icon-btn--edit"
                        onClick={e => openEdit(e, g)} title="Edit / Assign Modules">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                      </button>
                      <button className="mg-icon-btn mg-icon-btn--delete"
                        onClick={() => setDeleteModal(g)} title="Delete">
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
        <div className="mg-overlay" onClick={closeModal}>
          <div className="mg-modal" onClick={e => e.stopPropagation()}>
            <div className="mg-modal__header">
              <h2 className="mg-modal__title">{editTarget ? "Edit Group" : "New Group"}</h2>
              <button className="mg-modal__close" onClick={closeModal}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="18" height="18">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            {formError && <div className="mg-form-error">{formError}</div>}

            <div className="mg-form-group">
              <label className="mg-label">Group Name</label>
              <input className="mg-input" placeholder="e.g. G1, Group A…"
                value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
            </div>

            <div className="mg-form-group">
              <label className="mg-label">
                Modules <span className="mg-label-hint">(select all that apply)</span>
              </label>
              <div className="mg-module-grid">
                {modules.map(m => (
                  <label key={m.id}
                    className={`mg-module-chip ${form.module.includes(m.id) ? "mg-module-chip--active" : ""}`}>
                    <input type="checkbox" checked={form.module.includes(m.id)}
                      onChange={() => toggleModule(m.id)} hidden />
                    <span className="mg-module-chip__code">{m.code}</span>
                    <span className="mg-module-chip__name">{m.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mg-modal__footer">
              <button className="mg-btn mg-btn--ghost" onClick={closeModal}>Cancel</button>
              <button className="mg-btn mg-btn--primary" onClick={handleSave} disabled={saving}>
                {saving ? "Saving…" : editTarget ? "Save Changes" : "Create Group"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Students Modal */}
      {studentsModal && (
        <div className="mg-overlay" onClick={() => setStudentsModal(null)}>
          <div className="mg-modal" onClick={e => e.stopPropagation()}>
            <div className="mg-modal__header">
              <h2 className="mg-modal__title">Students in {studentsModal.name}</h2>
              <button className="mg-modal__close" onClick={() => setStudentsModal(null)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="18" height="18">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className="mg-students-list">
              {studentsModal.students.map((s, i) => (
                <div key={s.id} className="mg-student-row">
                  <div className="mg-student-avatar">
                    {(s.full_name || s.username).slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="mg-student-name">{s.full_name || s.username}</div>
                    <div className="mg-student-meta">Year {s.year} · Sem {s.semester}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteModal && (
        <div className="mg-overlay" onClick={() => setDeleteModal(null)}>
          <div className="mg-modal mg-modal--sm" onClick={e => e.stopPropagation()}>
            <div className="mg-modal__header">
              <h2 className="mg-modal__title">Delete Group</h2>
            </div>
            <p className="mg-modal__body">
              Delete <strong>{deleteModal.name}</strong>? All schedules linked to this group will also be removed.
            </p>
            <div className="mg-modal__footer">
              <button className="mg-btn mg-btn--ghost" onClick={() => setDeleteModal(null)}>Cancel</button>
              <button className="mg-btn mg-btn--danger" onClick={handleDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}