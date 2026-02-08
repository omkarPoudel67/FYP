import { useAuth } from "./context/authcontext";

const AuthGate = ({ children }) => {
  const { loading } = useAuth();

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
