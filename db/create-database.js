import { env } from 'node:process';
import dotenv from 'dotenv';
import { logger } from '../common/services/logger.js';
import { PGSQL_DUPLICATE_DATABASE_ERROR } from './pg-errors.js';
import { PgClient } from './PgClient.js';

dotenv.config();

const dbUrl = env.NODE_ENV === 'test' ? env.TEST_DATABASE_API_URL : env.DATABASE_API_URL;
const url = new URL(dbUrl);

const DB_TO_CREATE_NAME = url.pathname.slice(1);

url.pathname = '/postgres';

PgClient.getClient(url.href).then(async (client) => {
  try {
    await client.query_and_log(`CREATE DATABASE ${DB_TO_CREATE_NAME};`);
    logger.info('Database created');
    await client.end();
  } catch (error) {
    if (error.code === PGSQL_DUPLICATE_DATABASE_ERROR) {
      logger.info(`Database ${DB_TO_CREATE_NAME} already created`);
    } else {
      logger.error(`Database creation failed: ${error.detail}`);
    }
  } finally {
    await client.end();
  }
});
