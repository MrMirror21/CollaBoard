import Fastify from 'fastify';

const SERVER_PORT = 4000;
const SERVER_HOST = '0.0.0.0';

async function startServer() {
  const fastify = Fastify({
    logger: true,
  });

  fastify.get('/healthz', async () => ({ status: 'ok' }));

  try {
    await fastify.listen({
      port: SERVER_PORT,
      host: SERVER_HOST,
    });
  } catch (error) {
    fastify.log.error(error);
  }
}

startServer();
