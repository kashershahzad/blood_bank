import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import axios from 'axios';

import { ToastMessage } from '../utils/ToastMessage';
import { endPoints } from './ENV';

let instance = axios.create({
  baseURL: endPoints.BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const checkInternetConnection = async () => {
  try {
    const state = await NetInfo.fetch();
    if (!state.isConnected) {
      ToastMessage('No Internet Connection', 'error');
      throw new Error('No Internet Connection');
    }
  } catch (error) {
    console.error('Network check failed:', error);
    throw error;
  }
};

const handleApiError = (error, operation, url) => {
  console.log(`Error with URL: ${endPoints.BASE_URL}${url}`);
  console.log('================================================');

  if (error.response) {
    console.log(`${operation} Error Status:`, error.response.status);
    console.log(
      `${operation} Error Message:`,
      error.response.data?.message || error.response.statusText,
    );
    console.log(`${operation} Error:`, error.response.data || error.response);
    const errorMessage = error.response.data?.message || 'Something went wrong';
    ToastMessage(errorMessage, 'error');

    return {
      status: error.response.status,
      data: error.response.data,
      message: errorMessage,
    };
  } else if (error.request) {
    console.log(`${operation} Network Error:`, error.message);
    ToastMessage('Network error. Please check your connection.', 'error');

    return {
      status: 0,
      message: 'Network error',
      originalError: error.message,
    };
  } else {
    console.log(`${operation} Unexpected Error:`, error.message);
    ToastMessage('An unexpected error occurred', 'error');

    return {
      status: -1,
      message: error.message,
    };
  }
};

instance.interceptors.request.use(
  async config => {
    try {
      await checkInternetConnection();
      const token = await AsyncStorage.getItem('token');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      return config;
    } catch (error) {
      return Promise.reject(error);
    }
  },
  error => {
    return Promise.reject(error);
  },
);

instance.interceptors.response.use(
  response => {
    return response;
  },
  async function (error) {
    const originalRequest = error.config;

    const isAuthRequest =
      originalRequest.url.includes('auth/login') ||
      originalRequest.url.includes('auth/send-signup-otp') ||
      originalRequest.url.includes('auth/check-email') ||
      originalRequest.url.includes('auth/forgot-password') ||
      originalRequest.url.includes('auth/verify-reset-otp') ||
      originalRequest.url.includes('auth/verify-signup-otp') ||
      originalRequest.url.includes('auth/reset-password');

    if (
      error.response?.statusCode === 401 &&
      !originalRequest._retry &&
      !isAuthRequest
    ) {
      originalRequest._retry = true;

      try {
        const token = await AsyncStorage.getItem('token');

        const refreshToken = await AsyncStorage.getItem('refreshToken');
        if (token && !refreshToken) {
          throw new Error('No refresh token available');
        }

        const newAccessToken = await renewAuthToken(refreshToken);
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

        return instance(originalRequest);
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);

        await AsyncStorage.multiRemove(['token', 'refreshToken']);
        ToastMessage('Session expired. Please login again.', 'error');
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

const requestGet = async (url, params = {}) => {
  try {
    const response = await instance.get(url, { params });
    return response;
  } catch (error) {
    const errorInfo = handleApiError(error, 'GET', url);
    return { error: errorInfo };
  }
};

const requestPost = async (url, data = {}) => {
  try {
    const response = await instance.post(url, data);
    return response;
  } catch (error) {
    const errorInfo = handleApiError(error, 'POST', url);
    return { error: errorInfo };
  }
};

const requestPatch = async (url, data = {}) => {
  try {
    const response = await instance.patch(url, data);
    return response;
  } catch (error) {
    const errorInfo = handleApiError(error, 'PATCH', url);
    return { error: errorInfo };
  }
};

const requestPut = async (url, data = {}) => {
  try {
    const response = await instance.put(url, data);
    return response;
  } catch (error) {
    const errorInfo = handleApiError(error, 'PUT', url);
    return { error: errorInfo };
  }
};

const requestDelete = async (url, data = {}) => {
  try {
    const response = await instance.delete(url, { data });
    return response;
  } catch (error) {
    const errorInfo = handleApiError(error, 'DELETE', url);
    return { error: errorInfo };
  }
};

const renewAuthToken = async refreshToken => {
  try {
    const response = await axios.post(
      `${endPoints.BASE_URL}auth/refresh-token`,
      { refreshToken },
      {
        headers: { 'Content-Type': 'application/json' },
      },
    );

    const newToken = response.data.tokens;
    await AsyncStorage.setItem('token', newToken?.accessToken);
    await AsyncStorage.setItem('refreshToken', newToken?.refreshToken);

    console.log('Token refreshed successfully');
    return newToken;
  } catch (error) {
    console.error(
      'Token renewal failed:',
      error.response?.data || error.message,
    );
    throw error;
  }
};

const get = requestGet;
const post = requestPost;
const put = requestPut;
const patch = requestPatch;
const del = requestDelete;

export { del, get, patch, post, put };
