import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import "./CSS/ManageStudent.css";

const API_BASE = "http://localhost:8000/api";

const SEMESTERS = [1, 2, 3, 4, 5, 6];
const YEARS = [1, 2, 3];

const emptyForm = {
  first_name: "",
  last_name: "",
  email: "",
  phone_number: "",
  semester: "",
  year: "",
  group: "",
  password: "",
};

export default function ManageStudents() {
  const [students, setStudents]     = useState([]);
  const [groups, setGroups]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);

  // filters
  const [filters, setFilters] = useState({
    semester: "",
    year: "",
    group: "",
    search: "",
  });

  // modal state
  const [modal, setModal]           = useState(null); // null | "create" | "edit" | "delete"
  const [selectedStudent, setSelected] = useState(null);
  const [form, setForm]             = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast]           = useState(null);

  // ── Fetch students ───────────────────────────────────────────────
  const fetchStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters.semester) params.append("semester", filters.semester);
      if (filters.year)     params.append("year",     filters.year);
      if (filters.group)    params.append("group",    filters.group);
      if (filters.search)   params.append("search",   filters.search);

      const res  = await fetch(`${API_BASE}/students/info/?${params}`);
      const data = await res.json();
      setStudents(data);
    } catch (e) {
      setError("Failed to load students. Is the server running?");
    } finally {
      setLoading(false);
    }
  };

  // ── Fetch groups for dropdowns ───────────────────────────────────
  const fetchGroups = async () => {
    try {
      const res  = await fetch(`http://localhost:8000/schedule/groups/`); // adjust if your groups endpoint differs
      const data = await res.json();
      setGroups(data);
    } catch {
      // non-fatal — filters still work by typing
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [filters]);

  // ── Toast helper ─────────────────────────────────────────────────
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Modal helpers ────────────────────────────────────────────────
  const openCreate = () => {
    setForm(emptyForm);
    setFormErrors({});
    setModal("create");
  };

  const openEdit = (student) => {
    setSelected(student);
    setForm({
      first_name:   student.user.first_name,
      last_name:    student.user.last_name,
      email:        student.user.email,
      phone_number: student.user.phone_number,
      semester:     student.semester,
      year:         student.year,
      group:        student.group?.id ?? "",
      password:     "",
    });
    setFormErrors({});
    setModal("edit");
  };

  const openDelete = (student) => {
    setSelected(student);
    setModal("delete");
  };

  const closeModal = () => {
    setModal(null);
    setSelected(null);
    setForm(emptyForm);
    setFormErrors({});
  };

  // ── Form change ──────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: null }));
  };

  // ── CREATE ───────────────────────────────────────────────────────
  const handleCreate = async () => {
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/students/info/`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          ...form,
          semester: Number(form.semester),
          year:     Number(form.year),
          group:    Number(form.group),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message || "Student created successfully.");
        closeModal();
        fetchStudents();
      } else {
        setFormErrors(data);
      }
    } catch {
      showToast("Network error. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // ── EDIT ─────────────────────────────────────────────────────────
  const handleEdit = async () => {
    setSubmitting(true);
    try {
      const body = {
        first_name:   form.first_name,
        last_name:    form.last_name,
        email:        form.email,
        phone_number: form.phone_number,
        semester:     Number(form.semester),
        year:         Number(form.year),
        group:        Number(form.group),
      };

      const res = await fetch(`${API_BASE}/students/${selectedStudent.id}/`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) {
        showToast("Student updated successfully.");
        closeModal();
        fetchStudents();
      } else {
        setFormErrors(data);
      }
    } catch {
      showToast("Network error. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // ── DELETE ───────────────────────────────────────────────────────
  const handleDelete = async () => {
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/students/info/${selectedStudent.id}/`, {
        method: "DELETE",
      });
      if (res.ok) {
        showToast("Student deleted successfully.");
        closeModal();
        fetchStudents();
      } else {
        showToast("Failed to delete student.", "error");
      }
    } catch {
      showToast("Network error. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Render ───────────────────────────────────────────────────────
  return (
    <div className="teacher-layout">
      <Sidebar />

      <div className="teacher-layout__content">
        {/* Toast */}
        {toast && (
          <div className={`ms-toast ms-toast--${toast.type}`}>
            {toast.type === "success" ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5"/></svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            )}
            {toast.message}
          </div>
        )}

        {/* Page header */}
        <div className="ms-header">
          <div>
            <h1 className="ms-title">Manage Students</h1>
            <p className="ms-subtitle">
              {loading ? "Loading..." : `${students.length} student${students.length !== 1 ? "s" : ""} found`}
            </p>
          </div>
          <button className="ms-btn ms-btn--primary" onClick={openCreate}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add Student
          </button>
        </div>

        {/* Filters */}
        <div className="ms-filters">
          <div className="ms-search-wrap">
            <svg className="ms-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              className="ms-input ms-search"
              placeholder="Search by name or username…"
              value={filters.search}
              onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value }))}
            />
          </div>

          <select
            className="ms-input ms-select"
            value={filters.semester}
            onChange={(e) => setFilters((p) => ({ ...p, semester: e.target.value }))}
          >
            <option value="">All Semesters</option>
            {SEMESTERS.map((s) => <option key={s} value={s}>Semester {s}</option>)}
          </select>

          <select
            className="ms-input ms-select"
            value={filters.year}
            onChange={(e) => setFilters((p) => ({ ...p, year: e.target.value }))}
          >
            <option value="">All Years</option>
            {YEARS.map((y) => <option key={y} value={y}>Year {y}</option>)}
          </select>

          <select
            className="ms-input ms-select"
            value={filters.group}
            onChange={(e) => setFilters((p) => ({ ...p, group: e.target.value }))}
          >
            <option value="">All Groups</option>
            {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>

          {(filters.search || filters.semester || filters.year || filters.group) && (
            <button
              className="ms-btn ms-btn--ghost"
              onClick={() => setFilters({ semester: "", year: "", group: "", search: "" })}
            >
              Clear
            </button>
          )}
        </div>

        {/* Table */}
        <div className="ms-table-wrap">
          {error ? (
            <div className="ms-empty ms-empty--error">{error}</div>
          ) : loading ? (
            <div className="ms-empty">
              <div className="ms-spinner" />
              Loading students…
            </div>
          ) : students.length === 0 ? (
            <div className="ms-empty">No students found matching your filters.</div>
          ) : (
            <table className="ms-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Student</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Semester</th>
                  <th>Year</th>
                  <th>Group</th>
                  <th>Face</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s, idx) => (
                  <tr key={s.id}>
                    <td className="ms-td--muted">{idx + 1}</td>
                    <td>
                      <div className="ms-student-cell">
                        <div className="ms-avatar">
                          {s.user.first_name?.[0]}{s.user.last_name?.[0]}
                        </div>
                        <span className="ms-name">
                          {s.user.first_name} {s.user.last_name}
                        </span>
                      </div>
                    </td>
                    <td><code className="ms-code">{s.user.username}</code></td>
                    <td className="ms-td--muted">{s.user.email}</td>
                    <td className="ms-td--muted">{s.user.phone_number}</td>
                    <td><span className="ms-badge ms-badge--sem">Sem {s.semester}</span></td>
                    <td><span className="ms-badge ms-badge--year">Yr {s.year}</span></td>
                    <td>
                      {s.group ? (
                        <span className="ms-badge ms-badge--group">{s.group.name}</span>
                      ) : (
                        <span className="ms-td--muted">—</span>
                      )}
                    </td>
                    <td>
                      <span className={`ms-dot ${s.has_facial_data ? "ms-dot--on" : "ms-dot--off"}`}>
                        {s.has_facial_data ? "Yes" : "No"}
                      </span>
                    </td>
                    <td>
                      <div className="ms-actions">
                        <button className="ms-icon-btn ms-icon-btn--edit" onClick={() => openEdit(s)} title="Edit">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                        </button>
                        <button className="ms-icon-btn ms-icon-btn--delete" onClick={() => openDelete(s)} title="Delete">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6"/>
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

      {/* ── CREATE / EDIT MODAL ───────────────────────────────────── */}
      {(modal === "create" || modal === "edit") && (
        <div className="ms-overlay" onClick={closeModal}>
          <div className="ms-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ms-modal__header">
              <h2>{modal === "create" ? "Add New Student" : "Edit Student"}</h2>
              <button className="ms-modal__close" onClick={closeModal}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <div className="ms-modal__body">
              <div className="ms-form-row">
                <div className="ms-field">
                  <label>First Name</label>
                  <input className={`ms-input ${formErrors.first_name ? "ms-input--error" : ""}`}
                    name="first_name" value={form.first_name} onChange={handleChange} placeholder="John" />
                  {formErrors.first_name && <span className="ms-error">{formErrors.first_name}</span>}
                </div>
                <div className="ms-field">
                  <label>Last Name</label>
                  <input className={`ms-input ${formErrors.last_name ? "ms-input--error" : ""}`}
                    name="last_name" value={form.last_name} onChange={handleChange} placeholder="Doe" />
                  {formErrors.last_name && <span className="ms-error">{formErrors.last_name}</span>}
                </div>
              </div>

              <div className="ms-field">
                <label>Email</label>
                <input className={`ms-input ${formErrors.email ? "ms-input--error" : ""}`}
                  name="email" type="email" value={form.email} onChange={handleChange} placeholder="john@example.com" />
                {formErrors.email && <span className="ms-error">{formErrors.email}</span>}
              </div>

              <div className="ms-field">
                <label>Phone Number</label>
                <input className={`ms-input ${formErrors.phone_number ? "ms-input--error" : ""}`}
                  name="phone_number" value={form.phone_number} onChange={handleChange} placeholder="10-digit number" maxLength={10} />
                {formErrors.phone_number && <span className="ms-error">{formErrors.phone_number}</span>}
              </div>

              <div className="ms-form-row">
                <div className="ms-field">
                  <label>Semester</label>
                  <select className={`ms-input ${formErrors.semester ? "ms-input--error" : ""}`}
                    name="semester" value={form.semester} onChange={handleChange}>
                    <option value="">Select</option>
                    {SEMESTERS.map((s) => <option key={s} value={s}>Semester {s}</option>)}
                  </select>
                  {formErrors.semester && <span className="ms-error">{formErrors.semester}</span>}
                </div>
                <div className="ms-field">
                  <label>Year</label>
                  <select className={`ms-input ${formErrors.year ? "ms-input--error" : ""}`}
                    name="year" value={form.year} onChange={handleChange}>
                    <option value="">Select</option>
                    {YEARS.map((y) => <option key={y} value={y}>Year {y}</option>)}
                  </select>
                  {formErrors.year && <span className="ms-error">{formErrors.year}</span>}
                </div>
              </div>

              <div className="ms-field">
                <label>Group</label>
                <select className={`ms-input ${formErrors.group ? "ms-input--error" : ""}`}
                  name="group" value={form.group} onChange={handleChange}>
                  <option value="">Select group</option>
                  {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
                {formErrors.group && <span className="ms-error">{formErrors.group}</span>}
              </div>

              {modal === "create" && (
                <div className="ms-field">
                  <label>Password</label>
                  <input className={`ms-input ${formErrors.password ? "ms-input--error" : ""}`}
                    name="password" type="password" value={form.password} onChange={handleChange} placeholder="Temporary password" />
                  {formErrors.password && <span className="ms-error">{formErrors.password}</span>}
                  <span className="ms-hint">Student will receive this via email along with their username.</span>
                </div>
              )}
            </div>

            <div className="ms-modal__footer">
              <button className="ms-btn ms-btn--ghost" onClick={closeModal} disabled={submitting}>Cancel</button>
              <button
                className="ms-btn ms-btn--primary"
                onClick={modal === "create" ? handleCreate : handleEdit}
                disabled={submitting}
              >
                {submitting ? <span className="ms-spinner ms-spinner--sm" /> : null}
                {modal === "create" ? "Create Student" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRM MODAL ──────────────────────────────────── */}
      {modal === "delete" && selectedStudent && (
        <div className="ms-overlay" onClick={closeModal}>
          <div className="ms-modal ms-modal--sm" onClick={(e) => e.stopPropagation()}>
            <div className="ms-modal__header">
              <h2>Delete Student</h2>
              <button className="ms-modal__close" onClick={closeModal}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className="ms-modal__body">
              <div className="ms-delete-warn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              </div>
              <p className="ms-delete-text">
                Are you sure you want to delete{" "}
                <strong>{selectedStudent.user.first_name} {selectedStudent.user.last_name}</strong>?
                <br />
                <span className="ms-td--muted">This will permanently remove their account and all associated data.</span>
              </p>
            </div>
            <div className="ms-modal__footer">
              <button className="ms-btn ms-btn--ghost" onClick={closeModal} disabled={submitting}>Cancel</button>
              <button className="ms-btn ms-btn--danger" onClick={handleDelete} disabled={submitting}>
                {submitting ? <span className="ms-spinner ms-spinner--sm" /> : null}
                Delete Student
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}