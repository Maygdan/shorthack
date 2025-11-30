import axios from "axios";
import { ACCESS_TOKEN } from "./constants";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(ACCESS_TOKEN);
    if (token) {
      // Убираем возможные пробелы и лишние символы
      const cleanToken = token.trim();
      
      // Проверяем, что токен не пустой и имеет правильный формат JWT (3 части, разделенные точками)
      if (cleanToken && cleanToken.split('.').length === 3) {
        config.headers.Authorization = `Bearer ${cleanToken}`;
      } else {
        console.warn('Invalid token format, clearing token');
        localStorage.removeItem(ACCESS_TOKEN);
        localStorage.removeItem(REFRESH_TOKEN);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Добавляем interceptor для обработки ошибок ответа
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Если получили ошибку 401 (Unauthorized), очищаем токены
    if (error.response?.status === 401) {
      console.warn('Unauthorized, clearing tokens');
      localStorage.removeItem(ACCESS_TOKEN);
      localStorage.removeItem(REFRESH_TOKEN);
      // Перенаправляем на страницу входа, если не на ней уже
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
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

export const getCompletedEvents = async () => {
  try {
    const response = await api.get('/api/completed-events/');
    return response.data;
  } catch (error) {
    console.error('Error fetching completed events:', error);
    throw error;
  }
};

export const getMyFeedbacks = async () => {
  try {
    const response = await api.get('/api/my-feedbacks/');
    return response.data;
  } catch (error) {
    console.error('Error fetching feedbacks:', error);
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

// Мерч
export const getMerchandise = async () => {
  try {
    const response = await api.get('/api/merchandise/');
    return response.data;
  } catch (error) {
    console.error('Error fetching merchandise:', error);
    throw error;
  }
};

export const getMerchandiseDetail = async (merchId) => {
  try {
    const response = await api.get(`/api/merchandise/${merchId}/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching merchandise detail:', error);
    throw error;
  }
};

export const purchaseMerchandise = async (merchId, data) => {
  try {
    const response = await api.post(`/api/merchandise/${merchId}/purchase/`, data);
    return response.data;
  } catch (error) {
    console.error('Error purchasing merchandise:', error);
    throw error;
  }
};

export const getMerchOrders = async () => {
  try {
    const response = await api.get('/api/orders/');
    return response.data;
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};

export const getMerchOrderDetail = async (orderId) => {
  try {
    const response = await api.get(`/api/orders/${orderId}/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching order detail:', error);
    throw error;
  }
};

export default api;