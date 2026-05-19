import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

client.interceptors.request.use((config) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('[API]', config.method?.toUpperCase(), config.url);
  }
  return config;
});

client.interceptors.response.use(
  (r) => r,
  (e) => {
    const status = e?.response?.status || 500;
    let message = e?.response?.data?.detail || e?.message || 'Request failed';
    if (status === 429) {
      message =
        'Too many requests to the server. Wait a minute, then try again.';
    }
    return Promise.reject({ message, status, data: e?.response?.data || null });
  }
);

export default client;