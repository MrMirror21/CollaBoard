import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '../store/useAuthStore';

describe('useAuthStore', () => {
  // 각 테스트 전에 스토어 상태 초기화
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      accessToken: null,
      refreshToken: null,
    });
  });

  describe('setAuth', () => {
    it('user, accessToken, refreshToken 상태를 올바르게 업데이트한다', () => {
      // Given
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        name: '테스트 유저',
      };
      const mockAccessToken = 'access-token-abc';
      const mockRefreshToken = 'refresh-token-xyz';

      // When
      useAuthStore
        .getState()
        .setAuth(mockUser, mockAccessToken, mockRefreshToken);

      // Then
      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
      expect(state.accessToken).toBe(mockAccessToken);
      expect(state.refreshToken).toBe(mockRefreshToken);
    });
  });

  describe('logout', () => {
    it('모든 인증 상태를 null로 초기화한다', () => {
      // Given - 로그인된 상태 설정
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        name: '테스트 유저',
      };
      useAuthStore.setState({
        user: mockUser,
        accessToken: 'some-access-token',
        refreshToken: 'some-refresh-token',
      });

      // When
      useAuthStore.getState().logout();

      // Then
      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.accessToken).toBeNull();
      expect(state.refreshToken).toBeNull();
    });
  });
});
