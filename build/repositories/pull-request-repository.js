import { knex } from '../../db/knex-database-connection.js';

async function save({ number, repositoryName }) {
  return knex('pull_requests').insert({ number, repositoryName }).onConflict().ignore();
}

async function isAtLeastOneMergeInProgress(repositoryName) {
  const isAtLeastOneMergeInProgress = await knex('pull_requests')
    .select('isMerging')
    .where({ isMerging: true, repositoryName })
    .first();
  return Boolean(isAtLeastOneMergeInProgress);
}

async function getOldest(repositoryName) {
  return knex('pull_requests').where({ isMerging: false, repositoryName }).orderBy('createdAt', 'asc').first();
}

async function update({ number, repositoryName, isMerging }) {
  await knex('pull_requests').where({ number, repositoryName }).update({ isMerging });
}

async function remove({ number, repositoryName }) {
  await knex('pull_requests').where({ number, repositoryName }).delete();
}

export { save, isAtLeastOneMergeInProgress, getOldest, update, remove };
