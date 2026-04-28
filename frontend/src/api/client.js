import axios from 'axios';

const client = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000',
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
  (e) =>
    Promise.reject({
      message: e?.response?.data?.detail || e?.message || 'Request failed',
      status: e?.response?.status || 500,
      data: e?.response?.data || null,
    })
);

export default client;