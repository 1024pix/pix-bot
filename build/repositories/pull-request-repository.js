import { knex } from '../../db/knex-database-connection.js';

class PullRequestNotFoundError extends Error {}

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

async function findNotMerged(repositoryName) {
  return knex('pull_requests').where({ isMerging: false, repositoryName }).orderBy('createdAt', 'asc');
}

async function update({ number, repositoryName, isMerging }) {
  await knex('pull_requests').where({ number, repositoryName }).update({ isMerging });
}

async function remove({ number, repositoryName }) {
  await knex('pull_requests').where({ number, repositoryName }).delete();
}

async function get({ number, repositoryName }) {
  const pullRequest = await knex('pull_requests').where({ number, repositoryName }).first();
  return pullRequest || null;
}

export { save, isAtLeastOneMergeInProgress, findNotMerged, update, remove, get, PullRequestNotFoundError };
