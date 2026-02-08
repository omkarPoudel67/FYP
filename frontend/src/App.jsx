import { useState } from 'react'
import './App.css'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from './pages/Login';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from './pages/ResetPassword';
import FaceLogin from './pages/FaceLogin';
import Profile from './pages/Profile';
import Schedule from './pages/Schedule';
import Attendance from './pages/Attendence';
import Resources from './pages/Resources';
import Announcements from './pages/Announcements';
import Unauthorized401 from './pages/UnAuthorized';




function App() {
  const [count, setCount] = useState(0)

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:userId/:token" element={<ResetPassword />} />
        <Route path="/face-login" element={<FaceLogin />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/resources" element={<Resources />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/announcements" element={<Announcements />} />
        <Route path="/attendance" element={<Attendance />} />
        <Route path='/unauthorized' element={<Unauthorized401 />}></Route>
      </Routes>
    </Router>
  );
}

export default App
