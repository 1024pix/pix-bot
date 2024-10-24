import { env } from 'node:process';
import dotenv from 'dotenv';
import { logger } from '../common/services/logger.js';
import { PGSQL_NON_EXISTENT_DATABASE_ERROR } from './pg-errors.js';
import { PgClient } from './PgClient.js';

dotenv.config();

const dbUrl = env.NODE_ENV === 'test' ? env.TEST_DATABASE_API_URL : env.DATABASE_API_URL;

const url = new URL(dbUrl);

const DB_TO_DELETE_NAME = url.pathname.slice(1);

url.pathname = '/postgres';

PgClient.getClient(url.href).then(async (client) => {
  try {
    const WITH_FORCE = _withForceOption();
    await client.query_and_log(`DROP DATABASE ${DB_TO_DELETE_NAME}${WITH_FORCE};`);
    logger.info('Database dropped');
    await client.end();
  } catch (error) {
    if (error.code === PGSQL_NON_EXISTENT_DATABASE_ERROR) {
      logger.info(`Database ${DB_TO_DELETE_NAME} does not exist`);
    } else {
      logger.error(`Database drop failed: ${error.detail}`);
    }
  } finally {
    await client.end();
  }
});

function _withForceOption() {
  return env.FORCE_DROP_DATABASE === 'true' ? ' WITH (FORCE)' : '';
}
