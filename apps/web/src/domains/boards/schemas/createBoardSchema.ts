import { z } from 'zod';

const TITLE_MIN_LENGTH = 1;
const TITLE_MAX_LENGTH = 100;

export const createBoardSchema = z.object({
  title: z
    .string()
    .min(TITLE_MIN_LENGTH, '보드 제목을 입력해주세요.')
    .max(TITLE_MAX_LENGTH, '보드 제목은 100자 이하로 입력해주세요.'),
  backgroundColor: z.string(),
});

export type CreateBoardFormData = z.infer<typeof createBoardSchema>;

export const editBoardSchema = createBoardSchema
  .extend({
    boardId: z.string(),
  })
  .merge(createBoardSchema);

export type EditBoardFormData = z.infer<typeof editBoardSchema>;
