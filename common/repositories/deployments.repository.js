import { knex } from '../../db/knex-database-connection.js';
const TABLE_NAME = 'deployments';

async function isFromMonoRepo(appName) {
  return await knex.schema.hasColumn(TABLE_NAME, appName);
}

async function addDeployment({ tag, app }) {
  await knex(TABLE_NAME)
    .where({ tag })
    .update({ [app]: true });
}

async function createTag(tagName) {
  const exists = await knex(TABLE_NAME).where({ tag: tagName }).first();
  if (!exists) {
    await knex(TABLE_NAME).insert({ tag: tagName });
  }
}

async function removedeployments(tag) {
  await knex(TABLE_NAME).where({ tag }).delete();
}

async function getAppStateByTag(tag) {
  return await knex(TABLE_NAME).where({ tag }).first();
}

export { isFromMonoRepo, addDeployment, createTag, removedeployments, getAppStateByTag };
