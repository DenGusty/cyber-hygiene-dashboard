import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000",
});

export const registerUser = async (payload) => {
  const res = await api.post("/register", payload);
  return res.data;
};

export const loginUser = async (payload) => {
  const res = await api.post("/login", payload);
  return res.data;
};

export const fetchMe = async (token) => {
  const res = await api.get("/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};