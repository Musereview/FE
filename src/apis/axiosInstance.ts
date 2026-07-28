import axios from 'axios';

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'content-type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('accessToken');

    if (accessToken) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

export function setAuthorizationHeader(accessToken: string) {
  axiosInstance.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
}

export function clearAuthorizationHeader() {
  delete axiosInstance.defaults.headers.common.Authorization;
}
