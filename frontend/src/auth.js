import axios from "axios";

const BASE_URL = "http://localhost:8000/api";

export const loginUser = async (username, password) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/login/`,
      { username, password },
      {
        withCredentials: true, 
      }
    );

    return response.data;
  } catch (error) {

    const message =
      error.response?.data?.message || "Something went wrong";
    return { success: false, message };
  }
};