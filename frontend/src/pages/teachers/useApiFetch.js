import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/authcontext";

export function useApiFetch() {
  const { accessToken } = useAuth();
  const navigate = useNavigate();

  const apiFetch = useCallback(async (url, options = {}) => {
    if (!accessToken) return null;

    const res = await fetch(url, {
      ...options,
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        ...options.headers,
      },
    });

    if (res.status === 403) {
      navigate("/unauthorized");
      return null;
    }

    return res;
  }, [accessToken, navigate]);

  return { apiFetch, accessToken };
}