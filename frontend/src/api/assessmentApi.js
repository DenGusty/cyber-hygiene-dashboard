import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000",
});

export const fetchQuestions = async () => {
  const res = await api.get("/questions");
  return res.data;
};

export const submitAssessment = async (payload) => {
  const res = await api.post("/submit-assessment", payload);
  return res.data;
};

export const fetchRecommendations = async (assessmentId) => {
  const res = await api.get(`/recommendations/${assessmentId}`);
  return res.data;
};

export const fetchUserHistory = async (userId) => {
  const res = await api.get(`/user-history/${userId}`);
  return res.data;
};