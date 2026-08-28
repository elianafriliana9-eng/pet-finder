import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

export const getDevApiUrl = (): string => {
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const ip = hostUri.split(':')[0];
    return `http://${ip}:8001/api`;
  }
  return Platform.OS === 'android' ? 'http://10.0.2.2:8001/api' : 'http://localhost:8001/api';
};

export const DEFAULT_API_URL = getDevApiUrl();

const api = axios.create({
  baseURL: DEFAULT_API_URL,
  headers: {
    'Accept': 'application/json',
  },
  timeout: 10000,
});

api.interceptors.request.use(async (config) => {
  try {
    const customUrl = await AsyncStorage.getItem('custom_api_url');
    if (customUrl) {
      config.baseURL = customUrl;
    }
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    // Ignore storage read error
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.multiRemove(['token', 'user']);
    }
    return Promise.reject(error);
  }
);

export default api;
