import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import {
  register as registerUser,
  login as loginUser,
  getUserById,
} from './auth.service.js';
import type {
  RegisterRequest,
  LoginRequest,
  RefreshTokenRequest,
} from './auth.types.js';
import {
  JWT_ACCESS_TOKEN_EXPIRES_IN,
  JWT_REFRESH_TOKEN_EXPIRES_IN,
  type JwtPayload,
} from '../../lib/jwt.js';

export async function authRoutes(fastify: FastifyInstance) {
  // 회원가입
  fastify.post<{ Body: RegisterRequest }>(
    '/register',
    {
      schema: {
        body: {
          type: 'object',
          required: ['email', 'password', 'name'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 8 },
            name: { type: 'string', minLength: 1, maxLength: 50 },
          },
        },
      },
    },
    async (
      request: FastifyRequest<{ Body: RegisterRequest }>,
      reply: FastifyReply,
    ) => {
      try {
        const result = await registerUser(request.body);

        // JWT 토큰 생성
        const payload: JwtPayload = {
          userId: result.user.id,
          email: result.user.email,
        };

        const accessToken = fastify.jwt.sign(payload, {
          expiresIn: JWT_ACCESS_TOKEN_EXPIRES_IN,
        });
        const refreshToken = fastify.jwt.sign(payload, {
          expiresIn: JWT_REFRESH_TOKEN_EXPIRES_IN,
        });

        await reply.status(201).send({
          ...result,
          accessToken,
          refreshToken,
        });
      } catch (error) {
        if (error instanceof Error) {
          await reply.status(400).send({ error: error.message });
          return;
        }
        await reply.status(500).send({ error: '서버 오류가 발생했습니다.' });
      }
    },
  );

  // 로그인
  fastify.post<{ Body: LoginRequest }>(
    '/login',
    {
      schema: {
        body: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string' },
          },
        },
      },
    },
    async (
      request: FastifyRequest<{ Body: LoginRequest }>,
      reply: FastifyReply,
    ) => {
      try {
        const result = await loginUser(request.body);

        // JWT 토큰 생성
        const payload: JwtPayload = {
          userId: result.user.id,
          email: result.user.email,
        };

        const accessToken = fastify.jwt.sign(payload, {
          expiresIn: JWT_ACCESS_TOKEN_EXPIRES_IN,
        });
        const refreshToken = fastify.jwt.sign(payload, {
          expiresIn: JWT_REFRESH_TOKEN_EXPIRES_IN,
        });

        await reply.send({
          ...result,
          accessToken,
          refreshToken,
        });
      } catch (error) {
        if (error instanceof Error) {
          await reply.status(401).send({ error: error.message });
          return;
        }
        await reply.status(500).send({ error: '서버 오류가 발생했습니다.' });
      }
    },
  );

  // 토큰 갱신
  fastify.post<{ Body: RefreshTokenRequest }>(
    '/refresh',
    {
      schema: {
        body: {
          type: 'object',
          required: ['refreshToken'],
          properties: {
            refreshToken: { type: 'string' },
          },
        },
      },
    },
    async (
      request: FastifyRequest<{ Body: RefreshTokenRequest }>,
      reply: FastifyReply,
    ) => {
      try {
        // Refresh Token 검증
        const decoded = fastify.jwt.verify<JwtPayload>(
          request.body.refreshToken,
        );

        // 사용자 존재 확인
        const user = await getUserById(decoded.userId);

        // 새로운 토큰 발급
        const payload: JwtPayload = {
          userId: user.id,
          email: user.email,
        };

        const accessToken = fastify.jwt.sign(payload, {
          expiresIn: JWT_ACCESS_TOKEN_EXPIRES_IN,
        });
        const refreshToken = fastify.jwt.sign(payload, {
          expiresIn: JWT_REFRESH_TOKEN_EXPIRES_IN,
        });

        await reply.send({
          accessToken,
          refreshToken,
          user,
        });
      } catch {
        await reply.status(401).send({ error: '유효하지 않은 토큰입니다.' });
      }
    },
  );

  // 현재 사용자 정보 조회 (인증 필요)
  fastify.get(
    '/me',
    {
      preHandler: fastify.authenticate,
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const user = await getUserById(request.user.userId);
        await reply.send({ user });
      } catch {
        await reply.status(404).send({ error: '사용자를 찾을 수 없습니다.' });
      }
    },
  );
}
