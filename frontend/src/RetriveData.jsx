import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./context/authcontext";

export default function useStudentData() {
  const { accessToken, api } = useAuth();
  const navigate = useNavigate();

  const [studentData, setStudentData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudentData = async () => {
      console.log(accessToken)
      if (!accessToken) {
        navigate("/unauthorized");
        return;
      }

      try {
        const res = await api.post(
          "/api/students/get-student-data/",
          {},
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        setStudentData(res.data);
        console.log(studentData);
      } catch (err) {
        console.error("Failed to fetch student data", err);
        setError("Unauthorized");
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [accessToken]);

  return { studentData, loading, error };
}

export function useModules(groupId) {
  const { accessToken, api } = useAuth();
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!groupId || !accessToken) {
      setLoading(false);
      return;
    }

    const fetchModules = async () => {
      try {
        const res = await api.get(`/resources/modules?group_id=${groupId}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        setModules(res.data);
        console.log(res.data)
      } catch (err) {
        console.error("Failed to fetch modules:", err);
        setError("Failed to load modules");
      } finally {
        setLoading(false);
      }
    };

    fetchModules();
  }, [groupId, accessToken]);

  return { modules, loading, error };
}



export function useWeeks(moduleName) {
  const { accessToken, api } = useAuth();
  const [weeks, setWeeks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!moduleName || !accessToken) {
      setLoading(false);
      return;
    }

    const fetchWeeks = async () => {
      try {
       
        const encodedModule = encodeURIComponent(moduleName);
        const res = await api.get(`/resources/weeks?module=${encodedModule}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        setWeeks(res.data.weeks || []);
        console.log("Weeks data:", res.data);
      } catch (err) {
        console.error("Failed to fetch weeks:", err);
        setError("Failed to load weeks");
      } finally {
        setLoading(false);
      }
    };

    fetchWeeks();
  }, [moduleName, accessToken]);

  return { weeks, loading, error };
}


export function useResources(moduleName, week) {
  const { accessToken, api } = useAuth(); // get axios instance and token from context
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!moduleName || !week || !accessToken) {
      setLoading(false);
      return;
    }

    const fetchResources = async () => {
      try {
        const res = await api.get(
          `/resources/resources/?module=${encodeURIComponent(moduleName)}&week=${week}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        setResources(res.data);
        console.log("Resources:", res.data);
      } catch (err) {
        console.error("Failed to fetch resources:", err);
        if (err.response?.status === 404) {
          setError("No resources found for this module and week");
        } else {
          setError("Failed to load resources");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, [moduleName, week, accessToken]);

  return { resources, loading, error };
}

export function useSchedules(groupId) {
  const { accessToken, api } = useAuth(); 
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!groupId || !accessToken) {
      setLoading(false);
      return;
    }

    const fetchSchedules = async () => {
      try {
        const res = await api.get(`/schedule/schedules/`, {
          params: { group: groupId }, 
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        setSchedules(res.data);
        console.log("Schedules fetched:", res.data);
      } catch (err) {
        console.error("Failed to fetch schedules:", err);
        setError("Failed to load schedules");
      } finally {
        setLoading(false);
      }
    };

    fetchSchedules();
  }, [groupId, accessToken, api]);

  return { schedules, loading, error };
}

export function useAnnouncements() {
  const { accessToken, api } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!accessToken) {
      setLoading(false);
      return;
    }

    const fetchAnnouncements = async () => {
      try {
        const res = await api.get("/announcements/announcements/", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        setAnnouncements(res.data);
        console.log("Announcements fetched:", res.data);
      } catch (err) {
        console.error("Failed to fetch announcements:", err);
        setError("Failed to load announcements");
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, [accessToken, api]);

  return { announcements, loading, error };
}

export function useAttendanceHistory() {
  const { accessToken, api } = useAuth();
  const [attendance, setAttendance] = useState({ past: [], today: [], todays_schedule: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!accessToken) {
      setLoading(false);
      return;
    }

    const fetchAttendance = async () => {
      try {
        const res = await api.get("/attendance/history/", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        setAttendance(res.data);
        console.log("Attendance fetched:", res.data);
      } catch (err) {
        console.error("Failed to fetch attendance history:", err);
        setError("Failed to load attendance history");
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [accessToken, api]);

  return { attendance, loading, error };
}