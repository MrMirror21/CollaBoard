import { PrismaClient } from '@prisma/client';
import Fastify from 'fastify';

const prisma = new PrismaClient();
const SERVER_PORT = 4000;
const SERVER_HOST = '0.0.0.0';

async function startServer() {
  const fastify = Fastify({
    logger: true,
  });

  fastify.get('/healthz', async () => ({ status: 'ok' }));
  fastify.get('/db-check', async () => {
    const [{ now }] = await prisma.$queryRaw<{ now: Date }[]>`SELECT NOW()`;
    return { status: 'ok', now };
  });

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
