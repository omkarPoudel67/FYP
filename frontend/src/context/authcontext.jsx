import { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";


const BASE_URL = "http://localhost:8000";

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});


const AuthContext = createContext(null);


export async function refreshAccessToken() {
  try {
    const res = await axios.post(
      `${BASE_URL}/api/refresh-access-token/`,
      {},
      { withCredentials: true }
    );
    return res.data.access; 
  } catch (err) {
    console.log("No refresh token available. User must login.");
    return null; 
  }
}

export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(null); 
  const [loading, setLoading] = useState(true); 


  const contextRefreshAccessToken = async () => {
    const token = await refreshAccessToken();
    setAccessToken(token); 
     if (token) {
    console.log(" Access token saved successfully:");
  } else {
    console.log(" No access token available to save.");
  }
    return token;
  };


  useEffect(() => {
    const initializeAuth = async () => {
      await contextRefreshAccessToken();
      setLoading(false);
    };
    initializeAuth();
  }, []);


  const contextValue = {
    accessToken,
    setAccessToken,
    refreshAccessToken: contextRefreshAccessToken, 
    loading,
    api, 
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}


export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used outside AuthProvider");
  return ctx;
}