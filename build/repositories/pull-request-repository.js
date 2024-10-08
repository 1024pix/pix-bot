import { knex } from '../../db/knex-database-connection.js';

async function save({ number, repositoryName }) {
  return knex('pull_requests').insert({ number, repositoryName });
}

async function isAtLeastOneMergeInProgress() {
  const isAtLeastOneMergeInProgress = await knex('pull_requests')
    .select('isCurrentlyMerge')
    .where({ isCurrentlyMerge: true })
    .first();
  return Boolean(isAtLeastOneMergeInProgress);
}

async function update({ number, repositoryName, isCurrentlyMerge }) {
  await knex('pull_requests').where({ number, repositoryName }).update({ isCurrentlyMerge });
}

export { save, isAtLeastOneMergeInProgress, update };
