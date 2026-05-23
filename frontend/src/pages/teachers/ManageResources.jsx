import { useState, useEffect, useRef } from "react";
import Sidebar from "./components/Sidebar";
import "./CSS/ManageResources.css";

const API_BASE  = "http://localhost:8000";
const WEEKS     = Array.from({ length: 11 }, (_, i) => i + 1);
const TYPES     = ["lecture", "tutorial", "workshop"];
const YEARS     = [1, 2, 3];
const SEMESTERS = [1, 2, 3, 4, 5, 6];

const emptyForm = {
  title:       "",
  description: "",
  module:      "",
  type:        "",
  week:        "",
  file:        null,
};

export default function ManageResources() {
  const [resources, setResources] = useState([]);
  const [modules,   setModules]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);
  const fileInputRef              = useRef(null);

  const [filters, setFilters] = useState({
    module: "", year: "", semester: "", type: "", search: "",
  });

  const [modal,        setModal]      = useState(null);
  const [selected,     setSelected]   = useState(null);
  const [form,         setForm]       = useState(emptyForm);
  const [formErrors,   setFormErrors] = useState({});
  const [submitting,   setSubmitting] = useState(false);
  const [toast,        setToast]      = useState(null);
  const [autoYear,     setAutoYear]   = useState(null);
  const [autoSemester, setAutoSemester] = useState(null);

  const fetchResources = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters.module)   params.append("module",   filters.module);
      if (filters.year)     params.append("year",     filters.year);
      if (filters.semester) params.append("semester", filters.semester);
      if (filters.type)     params.append("type",     filters.type);
      if (filters.search)   params.append("search",   filters.search);
      const res  = await fetch(`${API_BASE}/resources/resources/info/?${params}`);
      const data = await res.json();
      setResources(Array.isArray(data) ? data : []);
    } catch {
      setError("Failed to load resources.");
    } finally {
      setLoading(false);
    }
  };

  const fetchModules = async () => {
    try {
      const res  = await fetch(`${API_BASE}/resources/modules/info/`);
      const data = await res.json();
      setModules(Array.isArray(data) ? data : []);
    } catch {}
  };

  useEffect(() => { fetchModules(); }, []);
  useEffect(() => { fetchResources(); }, [filters]);

  const filterModuleObj = modules.find(m => String(m.id) === String(filters.module));
  const moduleFiltered  = filters.module !== "";

  const handleFormModuleChange = (e) => {
    const modId = e.target.value;
    setForm(p => ({ ...p, module: modId }));
    setFormErrors(p => ({ ...p, module: null }));
    const mod = modules.find(m => String(m.id) === String(modId));
    if (mod) {
      setAutoYear(mod.year);
      setAutoSemester(mod.semester);
    } else {
      setAutoYear(null);
      setAutoSemester(null);
    }
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const openCreate = () => {
    setForm(emptyForm);
    setFormErrors({});
    setAutoYear(null);
    setAutoSemester(null);
    setModal("create");
  };

  const openEdit = (r) => {
    setSelected(r);
    setForm({
      title:       r.title,
      description: r.description || "",
      module:      String(r.module),
      type:        r.type,
      week:        String(r.week),
      file:        null,
    });
    setAutoYear(r.module_year);
    setAutoSemester(r.module_semester);
    setFormErrors({});
    setModal("edit");
  };

  const openDelete = (r) => {
    setSelected(r);
    setModal("delete");
  };

  const closeModal = () => {
    setModal(null);
    setSelected(null);
    setForm(emptyForm);
    setFormErrors({});
    setAutoYear(null);
    setAutoSemester(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
    setFormErrors(p => ({ ...p, [name]: null }));
  };

  const handleFileChange = (e) => {
    setForm(p => ({ ...p, file: e.target.files[0] || null }));
    setFormErrors(p => ({ ...p, file: null }));
  };

  const handleCreate = async () => {
    if (!form.file) {
      setFormErrors(p => ({ ...p, file: "Please select a file." }));
      return;
    }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("title",       form.title);
      fd.append("description", form.description);
      fd.append("module",      form.module);
      fd.append("type",        form.type);
      fd.append("week",        form.week);
      fd.append("file",        form.file);
      const res  = await fetch(`${API_BASE}/resources/resources/info/`, {
        method: "POST",
        body:   fd,
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message || "Resource uploaded.");
        closeModal();
        fetchResources();
      } else {
        setFormErrors(data);
      }
    } catch {
      showToast("Network error.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async () => {
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("title",       form.title);
      fd.append("description", form.description);
      fd.append("module",      form.module);
      fd.append("type",        form.type);
      fd.append("week",        form.week);
      if (form.file) fd.append("file", form.file);
      const res  = await fetch(`${API_BASE}/resources/resources/info/${selected.id}/`, {
        method: "PATCH",
        body:   fd,
      });
      const data = await res.json();
      if (res.ok) {
        showToast("Resource updated.");
        closeModal();
        fetchResources();
      } else {
        setFormErrors(data);
      }
    } catch {
      showToast("Network error.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/resources/resources/info/${selected.id}/`, {
        method: "DELETE",
      });
      if (res.ok) {
        showToast("Resource deleted.");
        closeModal();
        fetchResources();
      } else {
        showToast("Failed to delete.", "error");
      }
    } catch {
      showToast("Network error.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dt) =>
    dt ? new Date(dt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "--";

  return (
    <div className="teacher-layout">
      <Sidebar />
      <div className="teacher-layout__content">

        {toast && (
          <div className={`mr-toast mr-toast--${toast.type}`}>
            {toast.type === "success" ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 6L9 17l-5-5"/>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            )}
            {toast.message}
          </div>
        )}

        <div className="mr-header">
          <div>
            <h1 className="mr-title">Manage Resources</h1>
            <p className="mr-subtitle">
              {loading ? "Loading..." : `${resources.length} resource${resources.length !== 1 ? "s" : ""} found`}
            </p>
          </div>
          <button className="mr-btn mr-btn--primary" onClick={openCreate}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Upload Resource
          </button>
        </div>

        <div className="mr-filters">
          <div className="mr-search-wrap">
            <svg className="mr-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              className="mr-input mr-search"
              placeholder="Search by title..."
              value={filters.search}
              onChange={(e) => setFilters(p => ({ ...p, search: e.target.value }))}
            />
          </div>

          <select
            className="mr-input mr-select"
            value={filters.module}
            onChange={(e) => setFilters(p => ({ ...p, module: e.target.value, year: "", semester: "" }))}
          >
            <option value="">All Modules</option>
            {modules.map(m => (
              <option key={m.id} value={m.id}>{m.code} -- {m.name}</option>
            ))}
          </select>

          <div className="mr-filter-group">
            <select
              className={`mr-input mr-select ${moduleFiltered ? "mr-input--disabled" : ""}`}
              value={moduleFiltered ? (filterModuleObj?.year ?? "") : filters.year}
              disabled={moduleFiltered}
              onChange={(e) => setFilters(p => ({ ...p, year: e.target.value }))}
            >
              <option value="">All Years</option>
              {YEARS.map(y => (
                <option key={y} value={y}>Year {y}</option>
              ))}
            </select>
            {moduleFiltered && filterModuleObj && (
              <span className="mr-auto-label">Year {filterModuleObj.year}</span>
            )}
          </div>

          <div className="mr-filter-group">
            <select
              className={`mr-input mr-select ${moduleFiltered ? "mr-input--disabled" : ""}`}
              value={moduleFiltered ? (filterModuleObj?.semester ?? "") : filters.semester}
              disabled={moduleFiltered}
              onChange={(e) => setFilters(p => ({ ...p, semester: e.target.value }))}
            >
              <option value="">All Semesters</option>
              {SEMESTERS.map(s => (
                <option key={s} value={s}>Semester {s}</option>
              ))}
            </select>
            {moduleFiltered && filterModuleObj && (
              <span className="mr-auto-label">Sem {filterModuleObj.semester}</span>
            )}
          </div>

          <select
            className="mr-input mr-select"
            value={filters.type}
            onChange={(e) => setFilters(p => ({ ...p, type: e.target.value }))}
          >
            <option value="">All Types</option>
            {TYPES.map(t => (
              <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
            ))}
          </select>

          {(filters.search || filters.module || filters.year || filters.semester || filters.type) && (
            <button
              className="mr-btn mr-btn--ghost"
              onClick={() => setFilters({ module: "", year: "", semester: "", type: "", search: "" })}
            >
              Clear
            </button>
          )}
        </div>

        <div className="mr-table-wrap">
  {error && (
    <div className="mr-empty mr-empty--error">{error}</div>
  )}
  {loading && (
    <div className="mr-empty">
      <div className="mr-spinner" />
      Loading...
    </div>
  )}
  {!error && !loading && resources.length === 0 && (
    <div className="mr-empty">No resources found.</div>
  )}
  {!error && !loading && resources.length > 0 && (
    <table className="mr-table">
      <thead>
        <tr>
          <th>#</th>
          <th>Title</th>
          <th>Module</th>
          <th>Type</th>
          <th>Week</th>
          <th>Year / Sem</th>
          <th>Uploaded By</th>
          <th>Date</th>
          <th>File</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {resources.map((r, idx) => (
          <tr key={r.id} className="mr-row">
            <td className="mr-muted">{idx + 1}</td>
            <td>
              <div className="mr-title-cell">
                <span className="mr-res-title">{r.title}</span>
                {r.description && (
                  <span className="mr-res-desc">{r.description}</span>
                )}
              </div>
            </td>
            <td>
              <div className="mr-module-cell">
                <span className="mr-module-name">{r.module_name}</span>
                <span className="mr-module-code">{r.module_code}</span>
              </div>
            </td>
            <td>
              <span className={`mr-badge mr-badge--${r.type}`}>
                {r.type.charAt(0).toUpperCase() + r.type.slice(1)}
              </span>
            </td>
            <td className="mr-muted">Wk {r.week}</td>
            <td className="mr-muted">Yr {r.module_year} / Sem {r.module_semester}</td>
            <td className="mr-muted">{r.uploaded_by}</td>
            <td className="mr-muted">{formatDate(r.uploaded_at)}</td>
            <td>
              {r.file_url ? (
                <a
                  className="mr-download-btn"
                  href={`${API_BASE}${r.file_url}`}
                  download={r.file_name}
                  target="_blank"
                  rel="noreferrer"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                    <path d="M7 10l5 5 5-5"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  {r.file_name && r.file_name.length > 18
                    ? r.file_name.slice(0, 18) + "..."
                    : r.file_name}
                </a>
              ) : (
                <span className="mr-muted">--</span>
              )}
            </td>
            <td>
              <div className="mr-actions">
                <button
                  className="mr-icon-btn mr-icon-btn--edit"
                  onClick={() => openEdit(r)}
                  title="Edit"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </button>
                <button
                  className="mr-icon-btn mr-icon-btn--delete"
                  onClick={() => openDelete(r)}
                  title="Delete"
                >
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
  )}
</div>
      </div>

      {(modal === "create" || modal === "edit") && (
        <div className="mr-overlay" onClick={closeModal}>
          <div className="mr-modal" onClick={(e) => e.stopPropagation()}>
            <div className="mr-modal__header">
              <h2>{modal === "create" ? "Upload Resource" : "Edit Resource"}</h2>
              <button className="mr-modal__close" onClick={closeModal}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <div className="mr-modal__body">
              <div className="mr-field">
                <label>Title</label>
                <input
                  className={`mr-input ${formErrors.title ? "mr-input--error" : ""}`}
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Resource title"
                />
                {formErrors.title && (
                  <span className="mr-error">
                    {Array.isArray(formErrors.title) ? formErrors.title[0] : formErrors.title}
                  </span>
                )}
              </div>

              <div className="mr-field">
                <label>
                  Description <span className="mr-optional">(optional)</span>
                </label>
                <input
                  className="mr-input"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Brief description"
                />
              </div>

              <div className="mr-field">
                <label>Module</label>
                <select
                  className={`mr-input ${formErrors.module ? "mr-input--error" : ""}`}
                  name="module"
                  value={form.module}
                  onChange={handleFormModuleChange}
                >
                  <option value="">Select module</option>
                  {modules.map(m => (
                    <option key={m.id} value={m.id}>{m.code} -- {m.name}</option>
                  ))}
                </select>
                {formErrors.module && (
                  <span className="mr-error">
                    {Array.isArray(formErrors.module) ? formErrors.module[0] : formErrors.module}
                  </span>
                )}
              </div>

              {autoYear && autoSemester && (
                <div className="mr-auto-info">
                  <div className="mr-auto-chip">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="12" y1="8" x2="12" y2="12"/>
                      <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    Year {autoYear} - Semester {autoSemester}
                  </div>
                </div>
              )}

              <div className="mr-form-row">
                <div className="mr-field">
                  <label>Type</label>
                  <select
                    className={`mr-input ${formErrors.type ? "mr-input--error" : ""}`}
                    name="type"
                    value={form.type}
                    onChange={handleChange}
                  >
                    <option value="">Select type</option>
                    {TYPES.map(t => (
                      <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                    ))}
                  </select>
                  {formErrors.type && (
                    <span className="mr-error">
                      {Array.isArray(formErrors.type) ? formErrors.type[0] : formErrors.type}
                    </span>
                  )}
                </div>
                <div className="mr-field">
                  <label>Week</label>
                  <select
                    className={`mr-input ${formErrors.week ? "mr-input--error" : ""}`}
                    name="week"
                    value={form.week}
                    onChange={handleChange}
                  >
                    <option value="">Select week</option>
                    {WEEKS.map(w => (
                      <option key={w} value={w}>Week {w}</option>
                    ))}
                  </select>
                  {formErrors.week && (
                    <span className="mr-error">
                      {Array.isArray(formErrors.week) ? formErrors.week[0] : formErrors.week}
                    </span>
                  )}
                </div>
              </div>

              <div className="mr-field">
                <label>
                  File{" "}
                  {modal === "edit" && (
                    <span className="mr-optional">(leave empty to keep existing)</span>
                  )}
                </label>
                <div
                  className={`mr-file-drop ${formErrors.file ? "mr-file-drop--error" : ""}`}
                  onClick={() => fileInputRef.current && fileInputRef.current.click()}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                    <path d="M7 10l5 5 5-5"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  {form.file ? (
                    <span className="mr-file-name">{form.file.name}</span>
                  ) : (
                    <span>Click to select file</span>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.txt"
                />
                {formErrors.file && (
                  <span className="mr-error">{formErrors.file}</span>
                )}
              </div>
            </div>

            <div className="mr-modal__footer">
              <button className="mr-btn mr-btn--ghost" onClick={closeModal} disabled={submitting}>
                Cancel
              </button>
              <button
                className="mr-btn mr-btn--primary"
                onClick={modal === "create" ? handleCreate : handleEdit}
                disabled={submitting}
              >
                {submitting && <span className="mr-spinner mr-spinner--sm" />}
                {modal === "create" ? "Upload" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {modal === "delete" && selected && (
        <div className="mr-overlay" onClick={closeModal}>
          <div className="mr-modal mr-modal--sm" onClick={(e) => e.stopPropagation()}>
            <div className="mr-modal__header">
              <h2>Delete Resource</h2>
              <button className="mr-modal__close" onClick={closeModal}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className="mr-modal__body">
              <div className="mr-delete-warn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              </div>
              <p className="mr-delete-text">
                Delete <strong>"{selected.title}"</strong>?
                <br />
                <span className="mr-muted">The file will be permanently removed from the server.</span>
              </p>
            </div>
            <div className="mr-modal__footer">
              <button className="mr-btn mr-btn--ghost" onClick={closeModal} disabled={submitting}>
                Cancel
              </button>
              <button className="mr-btn mr-btn--danger" onClick={handleDelete} disabled={submitting}>
                {submitting && <span className="mr-spinner mr-spinner--sm" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}