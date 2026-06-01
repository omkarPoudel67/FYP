import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import "./CSS/ManageGroupSchedule.css";
import { useAuth } from "../../context/authcontext";

const API_BASE = "http://localhost:8000";
const ALL_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DAY_LABELS = {
  Mon: "Monday",
  Tue: "Tuesday",
  Wed: "Wednesday",
  Thu: "Thursday",
  Fri: "Friday",
  Sat: "Saturday",
  Sun: "Sunday",
};
const CLASS_TYPES = ["lecture", "tutorial", "workshop", "lab"];

export default function ManageGroupSchedule() {
  const { accessToken } = useAuth();
  const { groupId } = useParams();
  const navigate = useNavigate();

  const [group, setGroup] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);
  const guardRes = (res) => {
    if (res.status === 403) {
      navigate("/unauthorized");
      return false;
    }
    return true;
  };

  const emptyForm = {
    module: "",
    group: groupId,
    class_type: "",
    teacher: "",
    day: "",
    start_time: "",
    end_time: "",
    location: "",
    description: "",
  };
  const [form, setForm] = useState(emptyForm);

  // ── fetch ─────────────────────────────────────────────────────────────────
  const fetchGroup = async () => {
    try {
      const res = await fetch(`${API_BASE}/schedule/groups/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!guardRes(res)) return;
      const data = await res.json();
      setGroup(data.find((x) => String(x.id) === String(groupId)) || null);
    } catch {}
  };

  const fetchSchedules = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `${API_BASE}/schedule/schedules/manage/?group=${groupId}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );
      if (!guardRes(res)) return;
      const data = await res.json();
      setSchedules(data);
    } catch {
      setError("Failed to load schedules.");
    } finally {
      setLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      const res = await fetch(
        `${API_BASE}/teachers/teachers/?t=${Date.now()}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );
      if (!guardRes(res)) return;
      const data = await res.json();
      setTeachers(data);
    } catch {}
  };

  useEffect(() => {
    if (!accessToken) return;
    fetchGroup();
    fetchSchedules();
    fetchTeachers();
  }, [groupId, accessToken]);

  // ── modal helpers ─────────────────────────────────────────────────────────
  const openAdd = (day = "") => {
    setEditTarget(null);
    setForm({ ...emptyForm, group: groupId, day });
    setFormError(null);
    setModalOpen(true);
  };

  const openEdit = (s) => {
    setEditTarget(s);
    setForm({
      module: s.module,
      group: s.group,
      class_type: s.class_type,
      teacher: s.teacher || "",
      day: s.day,
      start_time: s.start_time,
      end_time: s.end_time,
      location: s.location || "",
      description: s.description || "",
    });
    setFormError(null);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditTarget(null);
    setFormError(null);
  };

  const handleSave = async () => {
    const required = ["module", "class_type", "day", "start_time", "end_time"];
    if (required.some((f) => !form[f])) {
      setFormError("Please fill in all required fields.");
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      const url = editTarget
        ? `${API_BASE}/schedule/schedules/${editTarget.id}/`
        : `${API_BASE}/schedule/schedules/manage/`;
      const method = editTarget ? "PUT" : "POST";
      const body = { ...form };
      if (!body.teacher) delete body.teacher;

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(body),
      });
      if (!guardRes(res)) return;
      const data = await res.json();
      if (!res.ok) {
        setFormError(
          data.non_field_errors?.[0] ||
            data.end_time?.[0] ||
            data.detail ||
            "Something went wrong.",
        );
        return;
      }
      await fetchSchedules();
      closeModal();
    } catch {
      setFormError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    try {
      const res = await fetch(
        `${API_BASE}/schedule/schedules/${deleteModal.id}/`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );
      if (!guardRes(res)) return;
      await fetchSchedules();
    } catch {}
    setDeleteModal(null);
  };

  const fmtTime = (t) => {
    if (!t) return "";
    const [h, m] = t.split(":");
    const hr = parseInt(h, 10);
    return `${hr % 12 || 12}:${m} ${hr >= 12 ? "PM" : "AM"}`;
  };

  const typeClass = (type) =>
    ({
      lecture: "mgs-type--lecture",
      tutorial: "mgs-type--tutorial",
      workshop: "mgs-type--workshop",
      lab: "mgs-type--lab",
    })[type] || "";

  // sessions keyed by day
  const byDay = ALL_DAYS.reduce((acc, d) => {
    acc[d] = schedules
      .filter((s) => s.day === d)
      .sort((a, b) => a.start_time.localeCompare(b.start_time));
    return acc;
  }, {});

  return (
    <div className="teacher-layout">
      <Sidebar />
      <div className="teacher-layout__content">
        {/* Header */}
        <div className="mgs-header">
          <div className="mgs-header__left">
            <button
              className="mgs-back"
              onClick={() => navigate("/teacher/schedules")}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                width="16"
                height="16"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
              Schedules
            </button>
            <div>
              <h1 className="mgs-title">
                {group ? group.name : "Group"} — Weekly Schedule
              </h1>
              <p className="mgs-subtitle">
                {loading
                  ? "Loading..."
                  : `${schedules.length} session${schedules.length !== 1 ? "s" : ""} this week`}
                {group?.modules?.length > 0 && (
                  <span className="mgs-module-list">
                    {" "}
                    · {group.modules.map((m) => m.code).join(", ")}
                  </span>
                )}
              </p>
            </div>
          </div>
          <button
            className="mgs-btn mgs-btn--primary"
            onClick={() => openAdd()}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              width="15"
              height="15"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Session
          </button>
        </div>

        {/* Students strip */}
        {group?.students?.length > 0 && (
          <div className="mgs-students-strip">
            <span className="mgs-strip-label">Students:</span>
            {group.students.slice(0, 8).map((s) => (
              <span
                key={s.id}
                className="mgs-student-chip"
                title={s.full_name || s.username}
              >
                {(s.full_name || s.username).slice(0, 2).toUpperCase()}
              </span>
            ))}
            {group.students.length > 8 && (
              <span className="mgs-student-chip mgs-student-chip--more">
                +{group.students.length - 8}
              </span>
            )}
            <span className="mgs-strip-count">
              {group.students.length} total
            </span>
          </div>
        )}

        {/* Weekly view */}
        {error ? (
          <div className="mgs-empty mgs-empty--error">{error}</div>
        ) : loading ? (
          <div className="mgs-empty">
            <div className="mgs-spinner" />
            Loading…
          </div>
        ) : (
          <div className="mgs-week">
            {ALL_DAYS.map((day) => (
              <div key={day} className="mgs-day-block">
                {/* Day header */}
                <div className="mgs-day-header">
                  <span className="mgs-day-label">{DAY_LABELS[day]}</span>
                  <button
                    className="mgs-day-add"
                    onClick={() => openAdd(day)}
                    title={`Add session on ${day}`}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      width="13"
                      height="13"
                    >
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Add
                  </button>
                </div>

                {/* Sessions or empty state */}
                {byDay[day].length === 0 ? (
                  <div className="mgs-no-class">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      width="20"
                      height="20"
                    >
                      <circle cx="12" cy="12" r="9" />
                      <line x1="9" y1="9" x2="15" y2="15" />
                      <line x1="15" y1="9" x2="9" y2="15" />
                    </svg>
                    No classes
                  </div>
                ) : (
                  <div className="mgs-cards">
                    {byDay[day].map((s) => (
                      <div key={s.id} className="mgs-card">
                        <div className="mgs-card__left">
                          <span
                            className={`mgs-type-badge ${typeClass(s.class_type)}`}
                          >
                            {s.class_type}
                          </span>
                          <div className="mgs-card__module">
                            {s.module_name}
                          </div>
                          <div className="mgs-card__code">{s.module_code}</div>
                        </div>
                        <div className="mgs-card__mid">
                          <div className="mgs-card__time">
                            {fmtTime(s.start_time)} — {fmtTime(s.end_time)}
                          </div>
                          {s.location && (
                            <div className="mgs-card__detail">
                              <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                width="12"
                                height="12"
                              >
                                <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" />
                                <circle cx="12" cy="10" r="3" />
                              </svg>
                              {s.location}
                            </div>
                          )}
                          {s.teacher && (
                            <div className="mgs-card__detail">
                              <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                width="12"
                                height="12"
                              >
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                <circle cx="12" cy="7" r="4" />
                              </svg>
                              {(() => {
                                const t = teachers.find(
                                  (t) => t.id === Number(s.teacher),
                                );
                                return t ? t.username : "Unassigned";
                              })()}
                            </div>
                          )}
                        </div>
                        <div className="mgs-card__actions">
                          <button
                            className="mgs-icon-btn mgs-icon-btn--edit"
                            onClick={() => openEdit(s)}
                          >
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              width="14"
                              height="14"
                            >
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>
                          <button
                            className="mgs-icon-btn mgs-icon-btn--delete"
                            onClick={() => setDeleteModal(s)}
                          >
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              width="14"
                              height="14"
                            >
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                              <path d="M10 11v6" />
                              <path d="M14 11v6" />
                              <path d="M9 6V4h6v2" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="mgs-overlay" onClick={closeModal}>
          <div className="mgs-modal" onClick={(e) => e.stopPropagation()}>
            <div className="mgs-modal__header">
              <h2 className="mgs-modal__title">
                {editTarget ? "Edit Session" : "Add Session"}
              </h2>
              <button className="mgs-modal__close" onClick={closeModal}>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  width="18"
                  height="18"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {formError && <div className="mgs-form-error">{formError}</div>}

            <div className="mgs-form-grid">
              <div className="mgs-form-group">
                <label className="mgs-label">
                  Module <span className="mgs-req">*</span>
                </label>
                <select
                  className="mgs-input"
                  value={form.module}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, module: e.target.value }))
                  }
                >
                  <option value="">Select module…</option>
                  {group?.modules?.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.code} — {m.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mgs-form-group">
                <label className="mgs-label">
                  Class Type <span className="mgs-req">*</span>
                </label>
                <select
                  className="mgs-input"
                  value={form.class_type}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, class_type: e.target.value }))
                  }
                >
                  <option value="">Select type…</option>
                  {CLASS_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mgs-form-group">
                <label className="mgs-label">
                  Day <span className="mgs-req">*</span>
                </label>
                <select
                  className="mgs-input"
                  value={form.day}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, day: e.target.value }))
                  }
                >
                  <option value="">Select day…</option>
                  {ALL_DAYS.map((d) => (
                    <option key={d} value={d}>
                      {DAY_LABELS[d]}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mgs-form-group">
                <label className="mgs-label">Teacher</label>
                <select
                  className="mgs-input"
                  value={form.teacher}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, teacher: e.target.value }))
                  }
                >
                  <option value="">Unassigned</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.username}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mgs-form-group">
                <label className="mgs-label">
                  Start Time <span className="mgs-req">*</span>
                </label>
                <input
                  type="time"
                  className="mgs-input"
                  value={form.start_time}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, start_time: e.target.value }))
                  }
                />
              </div>

              <div className="mgs-form-group">
                <label className="mgs-label">
                  End Time <span className="mgs-req">*</span>
                </label>
                <input
                  type="time"
                  className="mgs-input"
                  value={form.end_time}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, end_time: e.target.value }))
                  }
                />
              </div>

              <div className="mgs-form-group mgs-form-group--full">
                <label className="mgs-label">Location</label>
                <input
                  className="mgs-input"
                  placeholder="e.g. Room 204, Lab B…"
                  value={form.location}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, location: e.target.value }))
                  }
                />
              </div>

              <div className="mgs-form-group mgs-form-group--full">
                <label className="mgs-label">Description</label>
                <textarea
                  className="mgs-input mgs-textarea"
                  placeholder="Optional notes…"
                  value={form.description}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, description: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="mgs-modal__footer">
              <button className="mgs-btn mgs-btn--ghost" onClick={closeModal}>
                Cancel
              </button>
              <button
                className="mgs-btn mgs-btn--primary"
                onClick={handleSave}
                disabled={saving}
              >
                {saving
                  ? "Saving…"
                  : editTarget
                    ? "Save Changes"
                    : "Add Session"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteModal && (
        <div className="mgs-overlay" onClick={() => setDeleteModal(null)}>
          <div
            className="mgs-modal mgs-modal--sm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mgs-modal__header">
              <h2 className="mgs-modal__title">Delete Session</h2>
            </div>
            <p className="mgs-modal__body">
              Delete <strong>{deleteModal.class_type}</strong> on{" "}
              <strong>{DAY_LABELS[deleteModal.day]}</strong> from{" "}
              <strong>{fmtTime(deleteModal.start_time)}</strong> to{" "}
              <strong>{fmtTime(deleteModal.end_time)}</strong>?
            </p>
            <div className="mgs-modal__footer">
              <button
                className="mgs-btn mgs-btn--ghost"
                onClick={() => setDeleteModal(null)}
              >
                Cancel
              </button>
              <button
                className="mgs-btn mgs-btn--danger"
                onClick={handleDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
