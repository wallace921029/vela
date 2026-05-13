import path from 'path';
import { fileURLToPath } from 'url';
import { config as loadEnv } from 'dotenv';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import fastifyJwt from '@fastify/jwt';
import { initializeDatabase } from './db.js';
import { registerAuthenticatePlugin } from './plugins/authenticate.js';
import { registerAdminRoutes } from './router/admin.js';
import { registerAuthRoutes } from './router/auth.js';
import { registerNavRoutes } from './router/nav.js';

// Load .env from repo root (works for both `app/main.ts` in dev and `dist/main.js` after build).
const here = path.dirname(fileURLToPath(import.meta.url));
loadEnv({ path: path.resolve(here, '../../.env') });

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  throw new Error('JWT_SECRET environment variable is required. Copy .env.example to .env and set it.');
}

const fastify = Fastify({ logger: true });

initializeDatabase();

fastify.register(cors, {
  origin: '*',
});

fastify.register(fastifyJwt, {
  secret: jwtSecret,
});

registerAuthenticatePlugin(fastify);
registerAuthRoutes(fastify);
registerAdminRoutes(fastify);
registerNavRoutes(fastify);

const start = async () => {
  try {
    await fastify.listen({ port: 3000, host: '0.0.0.0' });
    console.log('Backend listening on http://localhost:3000');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
