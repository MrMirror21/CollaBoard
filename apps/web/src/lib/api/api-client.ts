/* eslint-disable no-param-reassign */
import axios, {
  type AxiosResponse,
  type AxiosError,
  type InternalAxiosRequestConfig,
} from 'axios';
import { useAuthStore } from '@/domains/auth/store/useAuthStore';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
});

// Request Interceptor: JWT 토큰 자동 추가
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const { token } = useAuthStore.getState();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor: 에러 처리
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError<{ error: { code: string; message: string } }>) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export default apiClient;
