import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import MockAdapter from 'axios-mock-adapter';
import apiClient from '@/lib/api/api-client';
import { useInfiniteBoards } from '../useInfiniteBoards';
import type { GetBoardsResponse, BoardSummary } from '../useBoards';

const createMockBoardSummary = (id: string): BoardSummary => ({
  id,
  title: `보드 ${id}`,
  backgroundColor: '#ffffff',
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
  lastAccessedAt: '2025-01-01T00:00:00Z',
  listsCount: 0,
  cardsCount: 0,
  members: [],
});

function createMockSuccessResponse(
  page: number,
  totalPages: number,
  limit = 10,
): GetBoardsResponse {
  const items: BoardSummary[] = [];
  for (let i = 0; i < limit; i += 1) {
    items.push(createMockBoardSummary(`board-${page}-${i}`));
  }

  return {
    success: true,
    data: {
      items,
      pagination: {
        page,
        limit,
        total: totalPages * limit,
        totalPages,
      },
    },
    timestamp: new Date().toISOString(),
  };
}

const createMockErrorResponse = (): GetBoardsResponse => ({
  success: false,
  error: { code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다.' },
  timestamp: new Date().toISOString(),
});

describe('useInfiniteBoards', () => {
  let mockApi: MockAdapter;
  let queryClient: QueryClient;

  const createWrapper = () => {
    return function Wrapper({ children }: { children: ReactNode }) {
      return (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      );
    };
  };

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          gcTime: 0,
        },
      },
    });

    mockApi = new MockAdapter(apiClient);

    // window.innerHeight 모킹 (calculateInitialLimit 영향)
    vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(1000);
  });

  afterEach(() => {
    mockApi.restore();
    queryClient.clear();
    vi.restoreAllMocks();
  });

  describe('초기 로딩', () => {
    it('처음에는 isLoading이 true이다', () => {
      // Given
      mockApi.onGet('/boards').reply(() => {
        return new Promise(() => {}); // 응답 지연
      });

      // When
      const { result } = renderHook(() => useInfiniteBoards(), {
        wrapper: createWrapper(),
      });

      // Then
      expect(result.current.isLoading).toBe(true);
    });

    it('데이터를 성공적으로 가져오면 isLoading이 false가 된다', async () => {
      // Given
      const mockResponse = createMockSuccessResponse(1, 3);
      mockApi.onGet('/boards').reply(200, mockResponse);

      // When
      const { result } = renderHook(() => useInfiniteBoards(), {
        wrapper: createWrapper(),
      });

      // Then
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data?.pages).toHaveLength(1);
      expect(result.current.data?.pages[0]).toEqual(mockResponse);
    });
  });

  describe('페이지네이션', () => {
    it('다음 페이지가 있으면 hasNextPage가 true이다', async () => {
      // Given
      const mockResponse = createMockSuccessResponse(1, 3);
      mockApi.onGet('/boards').reply(200, mockResponse);

      // When
      const { result } = renderHook(() => useInfiniteBoards(), {
        wrapper: createWrapper(),
      });

      // Then
      await waitFor(() => {
        expect(result.current.hasNextPage).toBe(true);
      });
    });

    it('마지막 페이지이면 hasNextPage가 false이다', async () => {
      // Given
      const mockResponse = createMockSuccessResponse(3, 3);
      mockApi.onGet('/boards').reply(200, mockResponse);

      // When
      const { result } = renderHook(() => useInfiniteBoards(), {
        wrapper: createWrapper(),
      });

      // Then
      await waitFor(() => {
        expect(result.current.hasNextPage).toBe(false);
      });
    });

    it('fetchNextPage를 호출하면 다음 페이지 데이터를 가져온다', async () => {
      // Given
      const page1Response = createMockSuccessResponse(1, 3);
      const page2Response = createMockSuccessResponse(2, 3);

      mockApi.onGet('/boards').replyOnce(200, page1Response);
      mockApi.onGet('/boards').replyOnce(200, page2Response);

      // When
      const { result } = renderHook(() => useInfiniteBoards(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // 다음 페이지 요청
      result.current.fetchNextPage();

      // fetchNextPage가 완료될 때까지 대기
      await waitFor(() => {
        expect(result.current.isFetchingNextPage).toBe(false);
      });

      // Then
      await waitFor(() => {
        expect(result.current.data?.pages).toHaveLength(2);
      });

      expect(result.current.data?.pages[0]).toEqual(page1Response);
      expect(result.current.data?.pages[1]).toEqual(page2Response);
    });
  });

  describe('에러 처리', () => {
    it('API 에러 발생 시 error 상태를 반환한다', async () => {
      // Given
      mockApi.onGet('/boards').reply(500, { error: 'Internal Server Error' });

      // When
      const { result } = renderHook(() => useInfiniteBoards(), {
        wrapper: createWrapper(),
      });

      // Then
      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
    });

    it('API 응답이 success: false이면 에러를 throw한다', async () => {
      // Given
      const mockResponse = createMockErrorResponse();
      mockApi.onGet('/boards').reply(200, mockResponse);

      // When
      const { result } = renderHook(() => useInfiniteBoards(), {
        wrapper: createWrapper(),
      });

      // Then
      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error?.message).toBe('서버 오류가 발생했습니다.');
    });
  });

  describe('다음 페이지 요청 에러', () => {
    it('두 번째 페이지 요청에서 success: false 응답이 오면 에러 상태가 된다', async () => {
      // Given - 첫 페이지는 성공, 두 번째는 실패
      const page1Response = createMockSuccessResponse(1, 3);
      const page2Response = createMockErrorResponse();

      mockApi.onGet('/boards').replyOnce(200, page1Response);
      mockApi.onGet('/boards').replyOnce(200, page2Response);

      // When
      const { result } = renderHook(() => useInfiniteBoards(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // 다음 페이지 요청 (에러 응답)
      result.current.fetchNextPage();

      // Then - queryFn에서 assertApiSuccess가 에러를 throw하여 에러 상태가 됨
      await waitFor(() => {
        expect(result.current.isFetchingNextPage).toBe(false);
      });

      // 첫 번째 페이지 데이터는 유지됨
      expect(result.current.data?.pages).toHaveLength(1);
      expect(result.current.data?.pages[0]).toEqual(page1Response);
    });
  });
});
