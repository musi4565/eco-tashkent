import axios from 'axios';

let rawUrl = process.env.API_URL || 'http://localhost:5000';
if (!/^https?:\/\//i.test(rawUrl)) rawUrl = 'http://' + rawUrl;

export const API_URL = rawUrl.replace(/\/+$/, '');
export const API_BASE = `${API_URL}/api`;

const api = axios.create({ baseURL: API_BASE, timeout: 15000 });

export function describeError(err) {
  if (err.response) {
    return `HTTP ${err.response.status} | URL: ${err.config?.baseURL || ''}${err.config?.url || ''} | Javob: ${JSON.stringify(err.response.data) || ''}`;
  }
  return `${err.message} | URL: ${err.config?.baseURL || ''}${err.config?.url || ''}`;
}

export async function getItems(params) {
  const { data } = await api.get('/items', { params });
  return data;
}

export async function getItem(id) {
  const { data } = await api.get(`/items/${id}`);
  return data;
}

export async function createRequest(itemId, message) {
  const { data } = await api.post('/requests', { itemId, message });
  return data;
}

export async function linkAccount(phone, password, chatId, username) {
  const { data } = await api.post('/bot/link', { phone, password, chatId, username });
  return data;
}

export async function getNewItems(since) {
  const { data } = await api.get('/bot/new-items', { params: { since } });
  return data;
}

export async function getNewRequests(since) {
  const { data } = await api.get('/bot/new-requests', { params: { since } });
  return data;
}

export async function getSubscribers() {
  const { data } = await api.get('/bot/subscribers');
  return data;
}

export async function setSubscriptions(chatId, categories) {
  const { data } = await api.patch(`/bot/subscribers/${chatId}`, { categories });
  return data;
}
