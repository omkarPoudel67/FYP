import React, { useState, useRef } from "react";
import Sidebar from "./Sidebar";
import { useAttendanceHistory } from "../RetriveData";
import { useAuth } from "../context/authcontext";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const Attendance = () => {
  const { accessToken, api } = useAuth();
  const { attendance, loading, error } = useAttendanceHistory();
  const now = new Date();

  const [message, setMessage] = useState("");
  const [cameraOpen, setCameraOpen] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  if (loading) return <p>Loading attendance...</p>;
  if (error) return <p>{error}</p>;

  // Prepare chart data
  const allRecords = [...attendance.past, ...attendance.today];

  const percentageData = Object.values(
    allRecords.reduce((acc, record) => {
      if (!acc[record.date]) {
        acc[record.date] = { date: record.date, total: 0, present: 0 };
      }

      acc[record.date].total += 1;

      if (record.status === "present") {
        acc[record.date].present += 1;
      }

      return acc;
    }, {})
  ).map((item) => ({
    date: item.date,
    percentage: Number(((item.present / item.total) * 100).toFixed(0)),
  }));

  // Check IP
  const handleTakeAttendance = async () => {
     try {
    const ipRes = await fetch("https://api.ipify.org?format=json");
    const ipData = await ipRes.json();
    const userIP = ipData.ip;

    const res = await api.post(
      "/attendance/check-ip/",
      { ip: userIP },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (res.data.status === "ok") {
      setMessage("IP verified. Opening camera...");
      openCamera();
    } else {
      setMessage(res.data.message);
    }

  } catch (err) {
    console.error("IP check failed:", err);
    setMessage("Failed to verify IP");
  }
  };

  // Open camera
  const openCamera = async () => {
    try {
      setCameraOpen(true);

      const stream = await navigator.mediaDevices.getUserMedia({ video: true });

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 200);

    } catch (err) {
      console.error(err);
      setMessage("Camera access denied");
    }
  };

  // Capture image
  const captureAndSend = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);

    canvas.toBlob(async (blob) => {
      const formData = new FormData();
      formData.append("image", blob, "face.jpg");

      try {
        const res = await fetch("http://127.0.0.1:8000/attendance/mark/", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();

        if (data.status === "ok") {
          setMessage("Attendance marked successfully");
        } else {
          setMessage(data.message);
        }
      } catch (err) {
        console.error(err);
        setMessage("Failed to send image");
      }
    }, "image/jpeg");
  };

  return (
    <div style={{ display: "flex" }}>
      {/* <Sidebar /> */}

      <div style={{ flex: 1, marginLeft: "160px", padding: "20px" }}>
        <h1>Attendance</h1>

        {/* Chart */}
        <section style={{ marginBottom: "40px" }}>
          <h2>Attendance Percentage Over Time</h2>

          {percentageData.length === 0 ? (
            <p>No attendance records to show.</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={percentageData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 100]} unit="%" />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="percentage"
                  stroke="#8884d8"
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </section>

        {/* Schedule */}
        <section>
          <h2>Today's Schedule</h2>

          {attendance.todays_schedule.length === 0 && <p>No classes today.</p>}

          <ul>
            {attendance.todays_schedule.map((s) => {
              const record = attendance.today.find(
                (a) => a.module_name === s.module_name
              );

              const startParts = s.start_time.split(":").map(Number);
              const endParts = s.end_time.split(":").map(Number);

              const startTime = new Date();
              startTime.setHours(startParts[0], startParts[1], 0, 0);

              const endTime = new Date();
              endTime.setHours(endParts[0], endParts[1], 0, 0);

              let displayStatus;
              const showButton = !record && now >= startTime && now <= endTime;

              if (now < startTime) {
                displayStatus = `Starting Soon (${s.start_time} - ${s.end_time})`;
              } else if (showButton) {
                displayStatus = (
                  <button onClick={handleTakeAttendance}>
                    Take Attendance Now
                  </button>
                );
              } else {
                displayStatus = record
                  ? `Status: ${record.status}`
                  : "Absent";
              }

              return (
                <li key={s.id}>
                  <strong>{s.module_name}</strong> - {s.location}
                  <br />
                  {displayStatus}
                </li>
              );
            })}
          </ul>

          {message && <p style={{ color: "green" }}>{message}</p>}
        </section>

        {/* Camera */}
        {cameraOpen && (
          <section style={{ marginTop: "40px" }}>
            <h2>Face Verification</h2>

            <video ref={videoRef} autoPlay style={{ width: "400px" }} />

            <br />
            <br />

            <button onClick={captureAndSend}>
              Capture & Submit Attendance
            </button>

            <canvas ref={canvasRef} style={{ display: "none" }} />
          </section>
        )}

        {/* Past */}
        <section style={{ marginTop: "40px" }}>
          <h2>Past Attendance</h2>

          {attendance.past.map((p, index) => (
            <li key={index}>
              <strong>{p.module_name}</strong> - {p.location}
              <br />
              {p.date} - Status: {p.status}
            </li>
          ))}
        </section>
      </div>
    </div>
  );
};

export default Attendance;