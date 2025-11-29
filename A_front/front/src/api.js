import axios from "axios";
import { ACCESS_TOKEN } from "./constants";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(ACCESS_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Новые методы для работы с мероприятиями
export const getEvents = async () => {
  try {
    const response = await api.get("/api/events/");
    return response.data;
  } catch (error) {
    console.error('Error fetching events:', error);
    throw error;
  }
};

export const startEvent = async (eventId) => {
  try {
    const response = await api.post(`/api/events/${eventId}/start/`);
    return response.data;
  } catch (error) {
    console.error('Error starting event:', error);
    throw error;
  }
};

export const submitQuiz = async (eventId, answers) => {
  try {
    const response = await api.post(`/api/events/${eventId}/submit-quiz/`, { answers });
    return response.data;
  } catch (error) {
    console.error('Error submitting quiz:', error);
    throw error;
  }
};

export const submitFeedback = async (eventId, feedback) => {
  try {
    const response = await api.post(`/api/events/${eventId}/feedback/`, feedback);
    return response.data;
  } catch (error) {
    console.error('Error submitting feedback:', error);
    throw error;
  }
};

export const getAnalytics = async (eventId) => {
  try {
    const response = await api.get(`/api/analytics/${eventId ? eventId : ''}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching analytics:', error);
    throw error;
  }
};

export default api;