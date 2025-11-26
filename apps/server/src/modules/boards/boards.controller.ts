import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { getBoards, createBoard, getBoardById } from './boards.service.js';
import { BoardNotFoundError, BoardAccessDeniedError } from './boards.errors.js';
import type {
  GetBoardsQuery,
  GetBoardsResponse,
  CreateBoardRequest,
  CreateBoardResponse,
  GetBoardByIdParams,
  GetBoardByIdResponse,
} from './boards.types.js';

export async function boardsRoutes(fastify: FastifyInstance) {
  /**
   * GET /boards - 보드 목록 조회
   * 인증된 사용자가 소유하거나 멤버로 참여 중인 보드 목록을 조회합니다.
   */
  fastify.get<{ Querystring: GetBoardsQuery }>(
    '/',
    {
      preHandler: fastify.authenticate,
      schema: {
        querystring: {
          type: 'object',
          properties: {
            page: { type: 'integer', minimum: 1, default: 1 },
            limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
          },
        },
      },
    },
    async (
      request: FastifyRequest<{ Querystring: GetBoardsQuery }>,
      reply: FastifyReply,
    ) => {
      try {
        const { page, limit } = request.query;
        const { userId } = request.user;

        const result = await getBoards({ userId, page, limit });

        const response: GetBoardsResponse = {
          success: true,
          data: result,
          timestamp: new Date().toISOString(),
        };

        await reply.send(response);
      } catch (error) {
        request.log.error(error);
        await reply.status(500).send({
          success: false,
          error: '보드 목록을 조회하는 중 오류가 발생했습니다.',
          timestamp: new Date().toISOString(),
        });
      }
    },
  );

  /**
   * POST /boards - 보드 생성
   * 새로운 보드를 생성하고 생성자를 owner로 설정합니다.
   */
  fastify.post<{ Body: CreateBoardRequest }>(
    '/',
    {
      preHandler: fastify.authenticate,
      schema: {
        body: {
          type: 'object',
          required: ['title'],
          properties: {
            title: { type: 'string', minLength: 1, maxLength: 100 },
            backgroundColor: {
              type: 'string',
              pattern: '^#[0-9A-Fa-f]{6}$',
              default: '#0079BF',
            },
          },
        },
      },
    },
    async (
      request: FastifyRequest<{ Body: CreateBoardRequest }>,
      reply: FastifyReply,
    ) => {
      try {
        const { userId } = request.user;

        const board = await createBoard({
          userId,
          data: request.body,
        });

        const response: CreateBoardResponse = {
          success: true,
          data: board,
          timestamp: new Date().toISOString(),
        };

        await reply.status(201).send(response);
      } catch (error) {
        request.log.error(error);
        await reply.status(500).send({
          success: false,
          error: '보드를 생성하는 중 오류가 발생했습니다.',
          timestamp: new Date().toISOString(),
        });
      }
    },
  );

  /**
   * GET /boards/:boardId - 보드 상세 조회
   * 보드 소유자 또는 멤버만 조회 가능합니다.
   * 리스트 목록(position 순 정렬)과 멤버 목록을 포함합니다.
   */
  fastify.get<{ Params: GetBoardByIdParams }>(
    '/:boardId',
    {
      preHandler: fastify.authenticate,
      schema: {
        params: {
          type: 'object',
          required: ['boardId'],
          properties: {
            boardId: { type: 'string' },
          },
        },
      },
    },
    async (
      request: FastifyRequest<{ Params: GetBoardByIdParams }>,
      reply: FastifyReply,
    ) => {
      try {
        const { boardId } = request.params;
        const { userId } = request.user;

        const board = await getBoardById({ boardId, userId });

        const response: GetBoardByIdResponse = {
          success: true,
          data: board,
          timestamp: new Date().toISOString(),
        };

        await reply.send(response);
      } catch (error) {
        if (error instanceof BoardNotFoundError) {
          await reply.status(404).send({
            success: false,
            error: '보드를 찾을 수 없습니다.',
            timestamp: new Date().toISOString(),
          });
          return;
        }

        if (error instanceof BoardAccessDeniedError) {
          await reply.status(403).send({
            success: false,
            error: '보드에 접근할 권한이 없습니다.',
            timestamp: new Date().toISOString(),
          });
          return;
        }

        request.log.error(error);
        await reply.status(500).send({
          success: false,
          error: '보드를 조회하는 중 오류가 발생했습니다.',
          timestamp: new Date().toISOString(),
        });
      }
    },
  );
}
