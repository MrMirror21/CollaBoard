import { useQuery } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

import apiClient from '@/lib/api/api-client';

const STALE_TIME_MS = 1000 * 60 * 5;
const REFETCH_INTERVAL_MS = 1000 * 60 * 5;
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

export interface ApiSuccessResponse<TData> {
  success: true;
  data: TData;
  timestamp: string;
}

export interface ApiErrorResponse {
  success: false;
  error: { code: string; message: string };
  timestamp: string;
}

export type ApiResponse<TData> = ApiSuccessResponse<TData> | ApiErrorResponse;

export interface BoardMemberSummary {
  id: string;
  name: string;
  avatar: string;
}

export interface BoardSummary {
  id: string;
  title: string;
  backgroundColor: string;
  createdAt: string;
  updatedAt: string;
  lastAccessedAt: string;
  listsCount: number;
  cardsCount: number;
  members: BoardMemberSummary[];
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface GetBoardsData {
  items: BoardSummary[];
  pagination: Pagination;
}

export type GetBoardsResponse = ApiResponse<GetBoardsData>;

export interface GetBoardsParams {
  page?: number;
  limit?: number;
}

export function assertApiSuccess<TData>(
  response: ApiResponse<TData>,
): asserts response is ApiSuccessResponse<TData> {
  if (response.success) return;
  throw new Error(response.error.message);
}

const useGetBoards = (params: GetBoardsParams = {}) => {
  const page = params.page ?? DEFAULT_PAGE;
  const limit = params.limit ?? DEFAULT_LIMIT;

  return useQuery<GetBoardsResponse, AxiosError>({
    queryKey: ['boards', { page, limit }],
    queryFn: async () => {
      const response = await apiClient.get<GetBoardsResponse>('/boards', {
        params: { page, limit },
      });

      assertApiSuccess(response.data);
      return response.data;
    },
    staleTime: STALE_TIME_MS,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchInterval: REFETCH_INTERVAL_MS,
    refetchIntervalInBackground: false,
  });
};

export default useGetBoards;
