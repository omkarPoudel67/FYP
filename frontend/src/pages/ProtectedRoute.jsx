import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // adjust path as needed

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: "grid", placeItems: "center", height: "100vh" }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}