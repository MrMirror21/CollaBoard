import { z } from 'zod';

const TITLE_MIN_LENGTH = 1;
const TITLE_MAX_LENGTH = 100;

export const boardBaseSchema = z.object({
  title: z
    .string()
    .min(TITLE_MIN_LENGTH, '보드 제목을 입력해주세요.')
    .max(TITLE_MAX_LENGTH, '보드 제목은 100자 이하로 입력해주세요.'),
  backgroundColor: z.string(),
});

export const createBoardSchema = boardBaseSchema;

export type CreateBoardFormData = z.infer<typeof createBoardSchema>;
export const createEditBoardSchema = (prev: {
  title: string;
  backgroundColor: string;
}) =>
  // eslint-disable-next-line @stylistic/implicit-arrow-linebreak
  boardBaseSchema
    .extend({
      boardId: z.string(),
    })
    .refine(
      (data) =>
        // eslint-disable-next-line @stylistic/implicit-arrow-linebreak
        data.title !== prev.title ||
        data.backgroundColor !== prev.backgroundColor,
      {
        message: '변경된 내용이 없습니다.',
        path: ['title'],
      },
    );

export type EditBoardFormData = z.infer<
  ReturnType<typeof createEditBoardSchema>
>;
