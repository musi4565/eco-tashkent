import axios from 'axios';

function resolveApiHost() {
  const env = import.meta.env.VITE_API_URL;
  if (env) return env.replace(/\/+$/, '').replace(/\/api$/, '');
  if (typeof window !== 'undefined' && window.location.hostname.includes('.onrender.com')) {
    const derived = window.location.hostname.replace(/-web\.onrender\.com$/, '-api.onrender.com');
    if (derived !== window.location.hostname) return 'https://' + derived;
  }
  return '';
}

export const API_HOST = resolveApiHost();

const api = axios.create({
  baseURL: API_HOST ? `${API_HOST}/api` : '/api',
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
  const base = API_HOST;
  if (base) return base.replace(/\/$/, '') + path;
  return path;
}

export default api;
