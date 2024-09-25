import { env } from 'node:process';
import * as url from 'node:url';
import * as dotenv from 'dotenv';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
dotenv.config({ path: `${__dirname}/../.env` });

function localAPIPostgresEnv(databaseUrl, knexAsyncStacktraceEnabled) {
  return {
    client: 'postgresql',
    connection: databaseUrl,
    pool: {
      min: 1,
      max: 4,
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: './migrations',
      loadExtensions: ['.js'],
    },
    seeds: {
      directory: './seeds',
      loadExtensions: ['.js'],
    },
    asyncStackTraces: knexAsyncStacktraceEnabled !== 'false',
  };
}
const environments = {
  development: localAPIPostgresEnv(
    env.DATABASE_API_URL,
    env.KNEX_ASYNC_STACKTRACE_ENABLED,
  ),

  test: localAPIPostgresEnv(
    env.TEST_DATABASE_API_URL,
    env.KNEX_ASYNC_STACKTRACE_ENABLED,
  ),

  production: {
    client: 'postgresql',
    connection: env.DATABASE_API_URL,
    pool: {
      min:
        Number.parseInt(env.DATABASE_API_CONNECTION_POOL_MIN_SIZE, 10) || 1,
      max:
        Number.parseInt(env.DATABASE_API_CONNECTION_POOL_MAX_SIZE, 10) || 1,
    },
    asyncStackTraces:
      env.KNEX_ASYNC_STACKTRACE_ENABLED_API !== 'false',
  },
};

export default environments;
