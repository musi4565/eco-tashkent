import axios from 'axios';

export const API_URL = process.env.API_URL || 'http://localhost:5000';

const api = axios.create({ baseURL: API_URL, timeout: 10000 });

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
