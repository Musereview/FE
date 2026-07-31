import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { clearTokens, getAccessToken, getRefreshToken, saveTokens } from '@/utils/authStorage';
import type { ApiResponse } from '@/types/api';
import type { ReissueRequest, ReissueResponse } from '@/types/auth';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'content-type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = getAccessToken();

    if (accessToken) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

interface RetriableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// 여러 요청이 동시에 401을 받아도 재발급은 한 번만
let refreshPromise: Promise<void> | null = null;

async function reissue() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new Error('refreshToken이 없습니다.');

  const body: ReissueRequest = { refreshToken };
  const { data } = await axios.post<ApiResponse<ReissueResponse>>(`${BASE_URL}/api/auth/reissue`, body, {
    headers: { 'content-type': 'application/json' },
  });

  saveTokens(data.data);
}

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetriableRequestConfig | undefined;

    // 401이 아니거나 이미 재발급 후 재시도한 요청이면 실패
    if (error.response?.status !== 401 || !originalRequest || originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      refreshPromise ??= reissue().finally(() => {
        refreshPromise = null;
      });
      await refreshPromise;

      // 새 accessToken은 위의 요청 인터셉터가 localStorage에서 붙임
      return await axiosInstance(originalRequest);
    } catch {
      clearTokens();
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  },
);
