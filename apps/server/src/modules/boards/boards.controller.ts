import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { getBoards } from './boards.service.js';
import type { GetBoardsQuery, GetBoardsResponse } from './boards.types.js';

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
}
