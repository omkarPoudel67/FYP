import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import "./CSS/ManageModule.css";
import { useAuth } from "../../context/authcontext";

export default function ManageModules() {
  const { api } = useAuth();
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [semesterFilter, setSemesterFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState({ name: "", code: "", year: 1, semester: 1 });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchModules(); }, []);

  async function fetchModules() {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/resources/modules/info/");
      setModules(res.data);
    } catch {
      setError("Failed to load modules.");
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditTarget(null);
    setForm({ name: "", code: "", year: 1, semester: 1 });
    setFormErrors({});
    setShowModal(true);
  }

  function openEdit(mod) {
    setEditTarget(mod);
    setForm({ name: mod.name, code: mod.code, year: mod.year, semester: mod.semester });
    setFormErrors({});
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditTarget(null);
    setForm({ name: "", code: "", year: 1, semester: 1 });
    setFormErrors({});
  }

  async function handleSubmit() {
    setSubmitting(true);
    setFormErrors({});
    try {
      if (editTarget) {
        await api.put(`/resources/modules/info/${editTarget.id}/`, form);
      } else {
        await api.post("/resources/modules/info/", form);
      }
      closeModal();
      fetchModules();
    } catch (err) {
      if (err.response?.data) {
        setFormErrors(err.response.data);
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    try {
      await api.delete(`/resources/modules/info/${deleteTarget.id}/`);
      setDeleteTarget(null);
      fetchModules();
    } catch {
      setDeleteTarget(null);
    }
  }

  const filtered = modules.filter(m => {
    const matchSearch =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.code.toLowerCase().includes(search.toLowerCase());
    const matchYear = yearFilter ? m.year === parseInt(yearFilter) : true;
    const matchSem = semesterFilter ? m.semester === parseInt(semesterFilter) : true;
    return matchSearch && matchYear && matchSem;
  });

  return (
    <div className="teacher-layout">
      <Sidebar />
      <div className="teacher-layout__content">
        <div className="mm-page">

          {/* Header */}
          <div className="mm-header">
            <div>
              <h1 className="mm-title">Manage Modules</h1>
              <p className="mm-subtitle">Add, edit or remove course modules</p>
            </div>
            <button className="mm-btn mm-btn--primary" onClick={openCreate}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Add Module
            </button>
          </div>

          {/* Filters */}
          <div className="mm-filters">
            <div className="mm-search-wrap">
              <svg className="mm-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                className="mm-input mm-search"
                placeholder="Search by name or code..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <select className="mm-input mm-select" value={yearFilter} onChange={e => setYearFilter(e.target.value)}>
              <option value="">All Years</option>
              <option value="1">Year 1</option>
              <option value="2">Year 2</option>
              <option value="3">Year 3</option>
            </select>
            <select className="mm-input mm-select" value={semesterFilter} onChange={e => setSemesterFilter(e.target.value)}>
              <option value="">All Semesters</option>
              {[1,2,3,4,5,6].map(s => <option key={s} value={s}>Semester {s}</option>)}
            </select>
            {(search || yearFilter || semesterFilter) && (
              <button className="mm-btn mm-btn--ghost" onClick={() => { setSearch(""); setYearFilter(""); setSemesterFilter(""); }}>
                Clear
              </button>
            )}
          </div>

          {/* Table */}
          <div className="mm-table-wrap">
            <table className="mm-table">
              <thead>
                <tr>
                  <th>Module</th>
                  <th>Code</th>
                  <th>Year</th>
                  <th>Semester</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="5">
                    <div className="mm-empty"><div className="mm-spinner"/><span>Loading modules...</span></div>
                  </td></tr>
                ) : error ? (
                  <tr><td colSpan="5">
                    <div className="mm-empty mm-empty--error">{error}</div>
                  </td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan="5">
                    <div className="mm-empty">No modules found.</div>
                  </td></tr>
                ) : filtered.map(mod => (
                  <tr key={mod.id} className="mm-row">
                    <td>
                      <div className="mm-module-cell">
                        <div className="mm-avatar">{mod.name.slice(0, 2)}</div>
                        <span className="mm-name">{mod.name}</span>
                      </div>
                    </td>
                    <td><span className="mm-badge">{mod.code}</span></td>
                    <td className="mm-muted">Year {mod.year}</td>
                    <td className="mm-muted">Sem {mod.semester}</td>
                    <td>
                      <div className="mm-actions">
                        <button className="mm-icon-btn mm-icon-btn--edit" onClick={() => openEdit(mod)} title="Edit">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                        </button>
                        <button className="mm-icon-btn mm-icon-btn--delete" onClick={() => setDeleteTarget(mod)} title="Delete">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 6h18"/>
                            <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                            <path d="M10 11v6M14 11v6"/>
                            <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Create / Edit Modal */}
          {showModal && (
            <div className="mm-overlay" onClick={closeModal}>
              <div className="mm-modal" onClick={e => e.stopPropagation()}>

                <div className="mm-modal__header">
                  <h2>{editTarget ? "Edit Module" : "Add Module"}</h2>
                  <button className="mm-modal__close" onClick={closeModal}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="18" y1="6" x2="6" y2="18"/>
                      <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>

                <div className="mm-modal__body">
                  <div className="mm-field">
                    <label>Module Name</label>
                    <input
                      className="mm-input"
                      value={form.name}
                      onChange={e => setForm({...form, name: e.target.value})}
                      placeholder="e.g. Data Structures"
                    />
                    {formErrors.name && <span className="mm-err">{Array.isArray(formErrors.name) ? formErrors.name[0] : formErrors.name}</span>}
                  </div>

                  <div className="mm-field">
                    <label>Module Code</label>
                    <input
                      className="mm-input"
                      value={form.code}
                      onChange={e => setForm({...form, code: e.target.value})}
                      placeholder="e.g. CS201"
                    />
                    {formErrors.code && <span className="mm-err">{Array.isArray(formErrors.code) ? formErrors.code[0] : formErrors.code}</span>}
                  </div>

                  <div className="mm-row-fields">
                    <div className="mm-field">
                      <label>Year</label>
                      <select className="mm-input mm-select" value={form.year} onChange={e => setForm({...form, year: parseInt(e.target.value)})}>
                        <option value={1}>Year 1</option>
                        <option value={2}>Year 2</option>
                        <option value={3}>Year 3</option>
                      </select>
                      {formErrors.year && <span className="mm-err">{formErrors.year}</span>}
                    </div>
                    <div className="mm-field">
                      <label>Semester</label>
                      <select className="mm-input mm-select" value={form.semester} onChange={e => setForm({...form, semester: parseInt(e.target.value)})}>
                        {[1,2,3,4,5,6].map(s => <option key={s} value={s}>Semester {s}</option>)}
                      </select>
                      {formErrors.semester && <span className="mm-err">{formErrors.semester}</span>}
                    </div>
                  </div>
                </div>

                <div className="mm-modal__footer">
                  <button className="mm-btn mm-btn--ghost" onClick={closeModal}>Cancel</button>
                  <button className="mm-btn mm-btn--primary" onClick={handleSubmit} disabled={submitting}>
                    {submitting ? "Saving..." : editTarget ? "Update" : "Create"}
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* Delete Modal */}
          {deleteTarget && (
            <div className="mm-overlay" onClick={() => setDeleteTarget(null)}>
              <div className="mm-modal mm-modal--sm" onClick={e => e.stopPropagation()}>

                <div className="mm-modal__header">
                  <h2>Delete Module</h2>
                  <button className="mm-modal__close" onClick={() => setDeleteTarget(null)}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="18" y1="6" x2="6" y2="18"/>
                      <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>

                <div className="mm-modal__body">
                  <div className="mm-delete-warn">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                      <line x1="12" y1="9" x2="12" y2="13"/>
                      <line x1="12" y1="17" x2="12.01" y2="17"/>
                    </svg>
                  </div>
                  <p className="mm-delete-text">
                    Delete <strong>"{deleteTarget.name}"</strong>?<br/>
                    <span className="mm-muted">All resources linked to this module will also be deleted.</span>
                  </p>
                </div>

                <div className="mm-modal__footer">
                  <button className="mm-btn mm-btn--ghost" onClick={() => setDeleteTarget(null)}>Cancel</button>
                  <button className="mm-btn mm-btn--danger" onClick={handleDelete}>Delete</button>
                </div>

              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}