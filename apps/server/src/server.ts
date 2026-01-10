import Fastify, { type FastifyRequest, type FastifyReply } from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import { prisma } from './lib/prisma.js';
import { authRoutes } from './modules/auth/auth.controller.js';
import { boardsRoutes } from './modules/boards/boards.controller.js';
import { JWT_SECRET, type JwtPayload } from './lib/jwt.js';

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (
      request: FastifyRequest,
      reply: FastifyReply,
    ) => Promise<void>;
  }
}

const SERVER_PORT = 4000;
const SERVER_HOST = '0.0.0.0';

// JWT 페이로드 타입 확장
declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: JwtPayload;
    user: JwtPayload;
  }
}

async function startServer() {
  const fastify = Fastify({
    logger: true,
  });

  // CORS 설정
  if (!process.env.FRONTEND_URL && process.env.NODE_ENV === 'production') {
    throw new Error('FRONTEND_URL is not set');
  }

  await fastify.register(cors, {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
  });

  // JWT 플러그인 등록
  await fastify.register(jwt, {
    secret: JWT_SECRET,
  });

  // JWT 인증 데코레이터
  fastify.decorate(
    'authenticate',
    async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
      try {
        await request.jwtVerify();
      } catch {
        await reply.status(401).send({ error: '인증이 필요합니다.' });
      }
    },
  );

  // Health check
  fastify.get('/healthz', async () => ({ status: 'ok' }));

  // DB 연결 확인
  fastify.get('/db-check', async () => {
    const result = await prisma.$queryRaw<{ now: Date }[]>`SELECT NOW() as now`;
    return { status: 'ok', now: result[0].now };
  });

  // 인증 라우트 등록
  await fastify.register(authRoutes, { prefix: '/auth' });

  // 보드 라우트 등록
  await fastify.register(boardsRoutes, { prefix: '/boards' });

  // Graceful shutdown
  fastify.addHook('onClose', async () => {
    await prisma.$disconnect();
  });

  try {
    await prisma.$connect();
    await fastify.listen({
      port: SERVER_PORT,
      host: SERVER_HOST,
    });
  } catch (error) {
    fastify.log.error(error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

startServer();
