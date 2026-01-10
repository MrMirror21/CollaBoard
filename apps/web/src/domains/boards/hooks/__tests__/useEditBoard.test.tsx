import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import {
  useEditBoard,
  type EditBoardInput,
} from '@/domains/boards/hooks/useEditBoard';
import apiClient from '@/lib/api/api-client';

// apiClient 모킹
vi.mock('@/lib/api/api-client', () => ({
  default: {
    patch: vi.fn(),
  },
}));

const mockApiClient = vi.mocked(apiClient);

describe('useEditBoard', () => {
  let queryClient: QueryClient;

  const createWrapper = () => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    return function Wrapper({ children }: { children: ReactNode }) {
      return (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      );
    };
  };

  const mockBoardInput: EditBoardInput = {
    boardId: 'board-123',
    title: '수정된 프로젝트 보드',
    backgroundColor: '#519839',
  };

  const mockBoardResponse = {
    id: 'board-123',
    title: '수정된 프로젝트 보드',
    backgroundColor: '#519839',
    createdAt: '2025-01-07T12:00:00.000Z',
    updatedAt: '2025-01-10T14:00:00.000Z',
    lastAccessedAt: '2025-01-10T14:00:00.000Z',
    listsCount: 3,
    cardsCount: 10,
    members: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    queryClient.clear();
  });

  describe('성공 케이스', () => {
    it('보드 수정 요청이 성공하면 수정된 보드 데이터를 반환한다', async () => {
      // Given
      mockApiClient.patch.mockResolvedValueOnce({
        data: {
          success: true,
          data: mockBoardResponse,
          timestamp: '2025-01-10T14:00:00.000Z',
        },
      });

      const { result } = renderHook(() => useEditBoard(), {
        wrapper: createWrapper(),
      });

      // When
      result.current.mutate(mockBoardInput);

      // Then
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockBoardResponse);
      expect(mockApiClient.patch).toHaveBeenCalledWith(
        `/boards/${mockBoardInput.boardId}`,
        {
          title: mockBoardInput.title,
          backgroundColor: mockBoardInput.backgroundColor,
        },
      );
    });

    it('보드 수정 성공 시 boards 쿼리가 무효화된다', async () => {
      // Given
      mockApiClient.patch.mockResolvedValueOnce({
        data: {
          success: true,
          data: mockBoardResponse,
          timestamp: '2025-01-10T14:00:00.000Z',
        },
      });

      // createWrapper()를 먼저 호출하여 queryClient를 생성한 후 spy 설정
      const wrapper = createWrapper();
      const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useEditBoard(), {
        wrapper,
      });

      // When
      result.current.mutate(mockBoardInput);

      // Then
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(invalidateQueriesSpy).toHaveBeenCalledWith({
        queryKey: ['boards'],
      });
    });
  });

  describe('실패 케이스', () => {
    it('API 응답이 success: false일 때 에러가 발생한다', async () => {
      // Given
      mockApiClient.patch.mockResolvedValueOnce({
        data: {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: '보드 제목이 유효하지 않습니다.',
          },
          timestamp: '2025-01-10T14:00:00.000Z',
        },
      });

      const { result } = renderHook(() => useEditBoard(), {
        wrapper: createWrapper(),
      });

      // When
      result.current.mutate(mockBoardInput);

      // Then
      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error?.message).toBe(
        '보드 제목이 유효하지 않습니다.',
      );
    });

    it('네트워크 에러 발생 시 에러 상태가 된다', async () => {
      // Given
      mockApiClient.patch.mockRejectedValueOnce(new Error('Network Error'));

      const { result } = renderHook(() => useEditBoard(), {
        wrapper: createWrapper(),
      });

      // When
      result.current.mutate(mockBoardInput);

      // Then
      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });

    it('권한 없는 보드 수정 시 에러가 발생한다', async () => {
      // Given
      mockApiClient.patch.mockResolvedValueOnce({
        data: {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: '보드를 수정할 권한이 없습니다.',
          },
          timestamp: '2025-01-10T14:00:00.000Z',
        },
      });

      const { result } = renderHook(() => useEditBoard(), {
        wrapper: createWrapper(),
      });

      // When
      result.current.mutate(mockBoardInput);

      // Then
      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error?.message).toBe(
        '보드를 수정할 권한이 없습니다.',
      );
    });
  });

  describe('상태 변화', () => {
    it('mutation 실행 중 isPending이 true가 된다', async () => {
      // Given
      let resolvePromise: (value: unknown) => void;
      const pendingPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      mockApiClient.patch.mockReturnValueOnce(pendingPromise as never);

      const { result } = renderHook(() => useEditBoard(), {
        wrapper: createWrapper(),
      });

      // When
      result.current.mutate(mockBoardInput);

      // Then
      await waitFor(() => {
        expect(result.current.isPending).toBe(true);
      });

      // Cleanup
      resolvePromise!({
        data: {
          success: true,
          data: mockBoardResponse,
          timestamp: '2025-01-10T14:00:00.000Z',
        },
      });

      await waitFor(() => {
        expect(result.current.isPending).toBe(false);
      });
    });

    it('초기 상태는 idle이다', () => {
      // Given & When
      const { result } = renderHook(() => useEditBoard(), {
        wrapper: createWrapper(),
      });

      // Then
      expect(result.current.isIdle).toBe(true);
      expect(result.current.isPending).toBe(false);
      expect(result.current.isSuccess).toBe(false);
      expect(result.current.isError).toBe(false);
    });
  });

  describe('mutateAsync', () => {
    it('mutateAsync는 Promise를 반환한다', async () => {
      // Given
      mockApiClient.patch.mockResolvedValueOnce({
        data: {
          success: true,
          data: mockBoardResponse,
          timestamp: '2025-01-10T14:00:00.000Z',
        },
      });

      const { result } = renderHook(() => useEditBoard(), {
        wrapper: createWrapper(),
      });

      // When
      const board = await result.current.mutateAsync(mockBoardInput);

      // Then
      expect(board).toEqual(mockBoardResponse);
    });

    it('mutateAsync 실패 시 Promise가 reject된다', async () => {
      // Given
      mockApiClient.patch.mockResolvedValueOnce({
        data: {
          success: false,
          error: {
            code: 'SERVER_ERROR',
            message: '서버 오류가 발생했습니다.',
          },
          timestamp: '2025-01-10T14:00:00.000Z',
        },
      });

      const { result } = renderHook(() => useEditBoard(), {
        wrapper: createWrapper(),
      });

      // When & Then
      await expect(result.current.mutateAsync(mockBoardInput)).rejects.toThrow(
        '서버 오류가 발생했습니다.',
      );
    });
  });

  describe('부분 수정', () => {
    it('제목만 수정해도 요청이 정상적으로 처리된다', async () => {
      // Given
      const titleOnlyInput: EditBoardInput = {
        boardId: 'board-123',
        title: '새로운 제목',
        backgroundColor: '#0079BF',
      };

      mockApiClient.patch.mockResolvedValueOnce({
        data: {
          success: true,
          data: { ...mockBoardResponse, title: '새로운 제목' },
          timestamp: '2025-01-10T14:00:00.000Z',
        },
      });

      const { result } = renderHook(() => useEditBoard(), {
        wrapper: createWrapper(),
      });

      // When
      result.current.mutate(titleOnlyInput);

      // Then
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.title).toBe('새로운 제목');
    });

    it('배경색만 수정해도 요청이 정상적으로 처리된다', async () => {
      // Given
      const colorOnlyInput: EditBoardInput = {
        boardId: 'board-123',
        title: '기존 제목',
        backgroundColor: '#D29034',
      };

      mockApiClient.patch.mockResolvedValueOnce({
        data: {
          success: true,
          data: { ...mockBoardResponse, backgroundColor: '#D29034' },
          timestamp: '2025-01-10T14:00:00.000Z',
        },
      });

      const { result } = renderHook(() => useEditBoard(), {
        wrapper: createWrapper(),
      });

      // When
      result.current.mutate(colorOnlyInput);

      // Then
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data?.backgroundColor).toBe('#D29034');
    });
  });
});
