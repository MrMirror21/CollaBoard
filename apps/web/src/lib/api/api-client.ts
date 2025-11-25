/* eslint-disable no-param-reassign */
import axios, {
  type AxiosResponse,
  type AxiosError,
  type InternalAxiosRequestConfig,
} from 'axios';
import { useAuthStore } from '@/domains/auth/store/useAuthStore';

const DEFAULT_BASE_URL = import.meta.env.VITE_API_URL;
const DEFAULT_TIMEOUT = 10000;

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  retry?: boolean;
}

interface CreateApiClientOptions {
  baseURL?: string;
  timeout?: number;
}

/**
 * API 클라이언트 팩토리 함수
 * 테스트에서 baseURL을 주입할 수 있도록 분리
 */
export function createApiClient(options: CreateApiClientOptions = {}) {
  const baseURL = options.baseURL ?? DEFAULT_BASE_URL;
  const timeout = options.timeout ?? DEFAULT_TIMEOUT;

  // 토큰 갱신용 별도 axios 인스턴스 (interceptor 무한 루프 방지)
  const refreshClient = axios.create({ baseURL, timeout });

  const apiClient = axios.create({ baseURL, timeout });

  // 토큰 갱신 중복 요청 방지를 위한 상태 관리
  let isRefreshing = false;
  let failedQueue: {
    resolve: (token: string) => void;
    reject: (error: Error) => void;
  }[] = [];

  const processQueue = (error: Error | null, token: string | null = null) => {
    failedQueue.forEach((prom) => {
      if (error) {
        prom.reject(error);
      } else {
        prom.resolve(token!);
      }
    });
    failedQueue = [];
  };

  // 토큰 갱신 상태 초기화 함수 (테스트용)
  const resetRefreshState = () => {
    isRefreshing = false;
    failedQueue = [];
  };

  // Request Interceptor: JWT 토큰 자동 추가
  apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const { accessToken } = useAuthStore.getState();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  });

  // Response Interceptor: 토큰 만료 시 자동 갱신
  apiClient.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError<{ error: { code: string; message: string } }>) => {
      const originalRequest = error.config as
        | RetryableRequestConfig
        | undefined;

      // 401 에러가 아니거나, 원본 요청이 없거나, 이미 재시도한 경우 에러 반환
      if (
        error.response?.status !== 401 ||
        !originalRequest ||
        originalRequest.retry
      ) {
        return Promise.reject(error);
      }

      // 이미 토큰 갱신 중이면 대기열에 추가
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      const { refreshToken } = useAuthStore.getState();

      // refreshToken이 없으면 로그아웃
      if (!refreshToken) {
        useAuthStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      originalRequest.retry = true;
      isRefreshing = true;

      try {
        // 별도 인스턴스로 토큰 갱신 요청 (무한 루프 방지)
        const response = await refreshClient.post<{
          accessToken: string;
          refreshToken: string;
          user: { id: string; email: string; name: string };
        }>('/auth/refresh', { refreshToken });

        const {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
          user,
        } = response.data;

        useAuthStore.getState().setAuth(user, newAccessToken, newRefreshToken);

        // 대기 중인 요청들 처리
        processQueue(null, newAccessToken);

        // 원래 요청 재시도
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return await apiClient(originalRequest);
      } catch (refreshError) {
        // 토큰 갱신 실패 시 대기 중인 요청들도 실패 처리
        processQueue(refreshError as Error, null);
        useAuthStore.getState().logout();
        window.location.href = '/login';
        throw refreshError;
      } finally {
        isRefreshing = false;
      }
    },
  );

  return { apiClient, refreshClient, resetRefreshState };
}

// 기본 API 클라이언트 인스턴스 (lazy 초기화)
let defaultApiClient: ReturnType<typeof createApiClient>['apiClient'] | null =
  null;

function getApiClient() {
  if (!defaultApiClient) {
    const { apiClient } = createApiClient();
    defaultApiClient = apiClient;
  }
  return defaultApiClient;
}

// Proxy를 사용해서 기존 코드 호환성 유지
const apiClient = new Proxy(
  {} as ReturnType<typeof createApiClient>['apiClient'],
  {
    get(_, prop) {
      return Reflect.get(getApiClient(), prop);
    },
  },
);

export default apiClient;
