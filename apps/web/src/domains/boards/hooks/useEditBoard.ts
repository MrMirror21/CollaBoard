import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

import apiClient from '@/lib/api/api-client';
import type {
  ApiSuccessResponse,
  ApiErrorResponse,
  BoardSummary,
} from '@/domains/boards/hooks/useBoards';

export interface EditBoardInput {
  boardId: string;
  title: string;
  backgroundColor: string;
}

type EditBoardResponse = ApiSuccessResponse<BoardSummary> | ApiErrorResponse;

interface EditBoardError {
  code: string;
  message: string;
}

/**
 * 보드 수정 mutation hook
 * 보드 수정 성공 시 boards 쿼리를 무효화하여 목록을 갱신합니다.
 */
export function useEditBoard() {
  const queryClient = useQueryClient();

  return useMutation<
    BoardSummary,
    AxiosError<{ error: EditBoardError }>,
    EditBoardInput
  >({
    mutationFn: async (input: EditBoardInput) => {
      const response = await apiClient.patch<EditBoardResponse>(
        `/boards/${input.boardId}`,
        { title: input.title, backgroundColor: input.backgroundColor },
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
