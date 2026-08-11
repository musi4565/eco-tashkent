import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return Promise.reject(err);
  }
);

export function imageUrl(path) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  const base = import.meta.env.VITE_API_URL || '';
  if (base) return base.replace(/\/$/, '') + path;
  return path;
}

export default api;
