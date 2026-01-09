import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

import apiClient from '@/lib/api/api-client';
import type {
  ApiSuccessResponse,
  ApiErrorResponse,
  BoardSummary,
} from '@/domains/boards/hooks/useBoards';

export interface CreateBoardInput {
  title: string;
  backgroundColor: string;
}

type CreateBoardResponse = ApiSuccessResponse<BoardSummary> | ApiErrorResponse;

interface CreateBoardError {
  code: string;
  message: string;
}

/**
 * 보드 생성 mutation hook
 * 보드 생성 성공 시 boards 쿼리를 무효화하여 목록을 갱신합니다.
 */
export function useCreateBoard() {
  const queryClient = useQueryClient();

  return useMutation<
    BoardSummary,
    AxiosError<{ error: CreateBoardError }>,
    CreateBoardInput
  >({
    mutationFn: async (input: CreateBoardInput) => {
      const response = await apiClient.post<CreateBoardResponse>(
        '/boards',
        input,
      );

      if (!response.data.success) {
        throw new Error(response.data.error.message);
      }

      return response.data.data;
    },
    onSuccess: () => {
      // 보드 목록 쿼리 무효화하여 최신 데이터 반영
      queryClient.invalidateQueries({ queryKey: ['boards'] });
    },
  });
}
