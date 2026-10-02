import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

export const BASE_URL = 'http://10.135.82.14:5000';
const API_URL = `${BASE_URL}/api`; // Updated to current local IP

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('token');
  console.log('API Request Interceptor - Token found:', !!token);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
