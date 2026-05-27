import { useState } from 'react'
import './App.css'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProtectedRoute from './pages/ProtectedRoute'; // adjust path

import Login from './pages/Login';
import StudentDashboard from './pages/StudentDashboard';
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from './pages/ResetPassword';
import FaceLogin from './pages/FaceLogin';
import Profile from './pages/Profile';
import Schedule from './pages/Schedule';
import Attendance from './pages/Attendence';
import Resources from './pages/Resources';
import Announcements from './pages/Announcements';
import Unauthorized401 from './pages/UnAuthorized';
import PublicDashboard from './pages/PublicDashboard';
import TeacherDashboard from './pages/teachers/TeacherDashboard';
import ManageStudents from './pages/teachers/ManageStudents';
import ManageTeachers from './pages/teachers/ManageTeachers';
import ManageAttendance from './pages/teachers/ManageAttendance';
import ManageAnnouncements from './pages/teachers/ManageAnnouncements';
import ManageSchedules from './pages/teachers/ManageSchedules';
import ManageResources from './pages/teachers/ManageResources';
import ManageProfile from './pages/teachers/ManageProfile';
import StudentAttendance from './pages/teachers/StudentAttendance';
import ManageModules from './pages/teachers/ManageModules';
import ManageGroups from './pages/teachers/ManageGroups';
import ManageGroupSchedule from './pages/teachers/ManageGroupSchedule';
import TeacherLogin from './pages/teachers/TeacherLogin';

// Helper to wrap a page in ProtectedRoute
const P = ({ element }) => <ProtectedRoute>{element}</ProtectedRoute>;

function App() {
  return (
    <Router>
      <Routes>
        
        <Route path="/login"                              element={<Login />} />
        <Route path="/forgot-password"                    element={<ForgotPassword />} />
        <Route path="/reset-password/:userId/:token"      element={<ResetPassword />} />
        <Route path="/face-login"                         element={<FaceLogin />} />
        <Route path="/unauthorized"                       element={<Unauthorized401 />} />
        <Route path="/public"                             element={<PublicDashboard />} />
        <Route path="/portal/teacher/auth"                element={<P element={<TeacherLo />} />} />

        
        <Route path="/"             element={<P element={<StudentDashboard />} />} />
        <Route path="/profile"      element={<P element={<Profile />} />} />
        <Route path="/resources"    element={<P element={<Resources />} />} />
        <Route path="/schedule"     element={<P element={<Schedule />} />} />
        <Route path="/announcements" element={<P element={<Announcements />} />} />
        <Route path="/attendance"   element={<P element={<Attendance />} />} />

        
        <Route path="/teacher/dashboard"    element={<P element={<TeacherDashboard />} />} />
        <Route path="/teacher/students"     element={<P element={<ManageStudents />} />} />
        <Route path="/teacher/teachers"     element={<P element={<ManageTeachers />} />} />
        <Route path="/teacher/attendance"   element={<P element={<ManageAttendance />} />} />
        <Route path="/teacher/attendance/:studentId" element={<P element={<StudentAttendance />} />} />
        <Route path="/teacher/announcements" element={<P element={<ManageAnnouncements />} />} />
        <Route path="/teacher/schedules"    element={<P element={<ManageSchedules />} />} />
        <Route path="/teacher/resources"    element={<P element={<ManageResources />} />} />
        <Route path="/teacher/profile"      element={<P element={<ManageProfile />} />} />
        <Route path="/teacher/modules"      element={<P element={<ManageModules />} />} />
        <Route path="/teacher/groups"       element={<P element={<ManageGroups />} />} />
        <Route path="/teacher/groups/:groupId/schedule" element={<P element={<ManageGroupSchedule />} />} />
      </Routes>
    </Router>
  );
}

export default App;