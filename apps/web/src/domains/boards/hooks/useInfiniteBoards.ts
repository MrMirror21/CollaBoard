import { useInfiniteQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import type { AxiosError } from 'axios';

import apiClient from '@/lib/api/api-client';
import calculateInitialLimit from '@/lib/utils/calculateInitialLimit';
import {
  assertApiSuccess,
  type GetBoardsResponse,
} from '@/domains/boards/hooks/useBoards';

const STALE_TIME_MS = 1000 * 60 * 5;

export function useInfiniteBoards() {
  const initialLimit = useMemo(() => calculateInitialLimit(), []);

  return useInfiniteQuery<GetBoardsResponse, AxiosError>({
    queryKey: ['boards', 'infinite', { limit: initialLimit }],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await apiClient.get<GetBoardsResponse>('/boards', {
        params: { page: pageParam, limit: initialLimit },
      });

      assertApiSuccess(response.data);
      return response.data;
    },
    getNextPageParam: (lastPage: GetBoardsResponse) => {
      if (!lastPage.success) return undefined;

      const { pagination } = lastPage.data;
      return pagination.page < pagination.totalPages
        ? pagination.page + 1
        : undefined;
    },
    initialPageParam: 1,
    staleTime: STALE_TIME_MS,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}
