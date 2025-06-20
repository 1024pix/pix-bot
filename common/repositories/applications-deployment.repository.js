import { knex } from '../../db/knex-database-connection.js';
import { config } from '../../config.js';

const TABLE_NAME = 'applications_deployments';

async function createVersion({ version, environment }) {
  const appWithVersions = config.PIX_APPS.map((app) => {
    return {
      version,
      environment,
      'app-name': app,
    };
  });
  await knex(TABLE_NAME).insert(appWithVersions);
}

async function markHasDeployed({ version, environment, app }) {
  return await knex(TABLE_NAME)
    .where({ version, 'app-name': app, environment })
    .update({ 'is-deployed': true, 'deployed-at': new Date() });
}

async function getByVersionAndEnvironment({ version, environment }) {
  const rows = await knex(TABLE_NAME).where({ version, environment }).select('app-name', 'is-deployed', 'deployed-at');
  return rows.map((row) => ({
    app: row['app-name'],
    isDeployed: row['is-deployed'],
    deployedAt: row['deployed-at'],
  }));
}

async function removeByVersionAndEnvironment({ version, environment }) {
  return await knex(TABLE_NAME).where({ version, environment }).del();
}

export { createVersion, markHasDeployed, getByVersionAndEnvironment, removeByVersionAndEnvironment };
