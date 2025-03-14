import { knex } from '../../db/knex-database-connection.js';

const TABLE_NAME = 'release-settings';
async function getStatus({ repositoryName, environment = 'production' }) {
  const result = await knex(TABLE_NAME).where({ repositoryName, environment }).first();
  return result;
}

async function updateStatus({ repositoryName, environment, authorizeDeployment, reason = null }) {
  if (authorizeDeployment) {
    return await knex(TABLE_NAME)
      .where({ repositoryName, environment })
      .update({ authorizeDeployment, blockReason: null, blockDate: null });
  }
  await knex(TABLE_NAME)
    .where({ repositoryName, environment })
    .update({ authorizeDeployment, blockReason: reason, blockDate: new Date() });
}

export { getStatus, updateStatus };
