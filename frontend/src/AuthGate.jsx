import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./context/authcontext";

const AuthGate = ({ children }) => {
  const { loading, accessToken } = useAuth();
  const navigate = useNavigate();  

  useEffect(() => {
    if (!loading && !accessToken) {
      navigate("/login"); 
    }
  }, [loading, accessToken]);

  if (loading) {
    return (
      <div style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontSize: "18px",
      }}>
        Initializing session...
      </div>
    );
  }

  return children;
};

export default AuthGate;