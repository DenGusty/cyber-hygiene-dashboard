import axios from "axios";
import { getToken } from "../utils/auth";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000",
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const fetchQuestions = async () => {
  const res = await api.get("/questions");
  return res.data;
};

export const submitAssessment = async (payload) => {
  const res = await api.post("/submit-assessment", payload);
  return res.data;
};

export const fetchUserHistory = async () => {
  const res = await api.get("/user-history");
  return res.data;
};

export const fetchAssessmentById = async (assessmentId) => {
  const res = await api.get(`/assessment/${assessmentId}`);
  return res.data;
};

export const fetchRecommendations = async (assessmentId) => {
  const res = await api.get(`/recommendations/${assessmentId}`);
  return res.data;
};