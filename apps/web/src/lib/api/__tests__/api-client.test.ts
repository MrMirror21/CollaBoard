import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  beforeAll,
  afterAll,
} from 'vitest';
import MockAdapter from 'axios-mock-adapter';
import { useAuthStore } from '@/domains/auth/store/useAuthStore';
import { createApiClient } from '../api-client';

const API_BASE_URL = 'http://localhost:4000';

describe('api-client', () => {
  // window.location 모킹
  const originalLocation = window.location;

  beforeAll(() => {
    // @ts-expect-error location 재정의 (테스트용)
    delete window.location;
    // @ts-expect-error location 재정의 (테스트용)
    window.location = { href: '' };
  });

  afterAll(() => {
    // @ts-expect-error location 재정의 (테스트용)
    window.location = originalLocation;
  });
  let apiClient: ReturnType<typeof createApiClient>['apiClient'];
  let refreshClient: ReturnType<typeof createApiClient>['refreshClient'];
  let resetRefreshState: ReturnType<
    typeof createApiClient
  >['resetRefreshState'];
  let mockApi: MockAdapter;
  let mockRefresh: MockAdapter;

  beforeEach(() => {
    // 스토어 상태 초기화
    useAuthStore.setState({
      user: null,
      accessToken: null,
      refreshToken: null,
    });
    window.location.href = '';

    // API 클라이언트 생성
    const client = createApiClient({ baseURL: API_BASE_URL });
    apiClient = client.apiClient;
    refreshClient = client.refreshClient;
    resetRefreshState = client.resetRefreshState;

    // Mock adapters 설정
    mockApi = new MockAdapter(apiClient);
    mockRefresh = new MockAdapter(refreshClient);
  });

  afterEach(() => {
    mockApi.restore();
    mockRefresh.restore();
  });

  describe('createApiClient', () => {
    it('baseURL이 올바르게 설정된다', () => {
      expect(apiClient.defaults.baseURL).toBe(API_BASE_URL);
    });
  });

  describe('Request Interceptor', () => {
    it('accessToken이 있으면 Authorization 헤더에 자동 추가한다', async () => {
      // Given
      const mockAccessToken = 'test-access-token-123';
      useAuthStore.setState({ accessToken: mockAccessToken });

      let capturedAuthHeader: string | undefined;

      mockApi.onGet('/api/test').reply((config) => {
        capturedAuthHeader = config.headers?.Authorization as string;
        return [200, { success: true }];
      });

      // When
      await apiClient.get('/api/test');

      // Then
      expect(capturedAuthHeader).toBe(`Bearer ${mockAccessToken}`);
    });
  });

  describe('Response Interceptor', () => {
    it('401 에러 시 토큰 갱신 후 원래 요청을 재시도한다', async () => {
      // Given
      const oldAccessToken = 'old-access-token';
      const oldRefreshToken = 'old-refresh-token';
      const newAccessToken = 'new-access-token';
      const newRefreshToken = 'new-refresh-token';
      const mockUser = { id: '1', email: 'test@test.com', name: 'Test User' };

      useAuthStore.setState({
        accessToken: oldAccessToken,
        refreshToken: oldRefreshToken,
        user: mockUser,
      });

      let apiCallCount = 0;
      let lastAuthHeader: string | undefined;

      // API 요청 핸들러 - 첫 번째는 401, 두 번째는 성공
      mockApi.onGet('/api/protected').reply((config) => {
        apiCallCount += 1;
        lastAuthHeader = config.headers?.Authorization as string;

        if (apiCallCount === 1) {
          return [401, { error: 'Unauthorized' }];
        }
        return [200, { data: 'protected-data' }];
      });

      // 토큰 갱신 엔드포인트
      mockRefresh.onPost('/auth/refresh').reply(200, {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        user: mockUser,
      });

      // When
      const response = await apiClient.get('/api/protected');

      // Then
      expect(response.data).toEqual({ data: 'protected-data' });
      expect(apiCallCount).toBe(2); // 원래 요청 + 재시도
      expect(lastAuthHeader).toBe(`Bearer ${newAccessToken}`);

      // 스토어에 새 토큰 저장 확인
      const state = useAuthStore.getState();
      expect(state.accessToken).toBe(newAccessToken);
      expect(state.refreshToken).toBe(newRefreshToken);
    });

    it('토큰 갱신 실패 시 로그아웃하고 로그인 페이지로 리다이렉트한다', async () => {
      // Given
      const oldAccessToken = 'old-access-token';
      const oldRefreshToken = 'old-refresh-token';
      const mockUser = { id: '1', email: 'test@test.com', name: 'Test User' };

      useAuthStore.setState({
        accessToken: oldAccessToken,
        refreshToken: oldRefreshToken,
        user: mockUser,
      });

      // API 요청 401 반환
      mockApi.onGet('/api/protected').reply(401, { error: 'Unauthorized' });

      // 토큰 갱신 실패
      mockRefresh
        .onPost('/auth/refresh')
        .reply(401, { error: 'Invalid refresh token' });

      // When & Then
      await expect(apiClient.get('/api/protected')).rejects.toThrow();

      // 로그아웃 확인
      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.accessToken).toBeNull();
      expect(state.refreshToken).toBeNull();

      // 리다이렉트 확인
      expect(window.location.href).toBe('/login');
    });
  });
});
