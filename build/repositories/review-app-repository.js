import { knex } from '../../db/knex-database-connection.js';

export const create = async function ({ name, repository, prNumber, parentApp }) {
  await knex('review-apps').insert({ name, repository, prNumber, parentApp }).onConflict('name').merge({
    createdAt: new Date(),
    status: 'pending',
  });
};

export const markAsDeployed = async function ({ name }) {
  const result = await knex('review-apps')
    .update({ status: 'success' })
    .where({ name })
    .returning(['repository', 'prNumber']);
  if (result.length === 0) {
    throw new Error(`${name} doesn't exist.`);
  }
  return result[0];
};

export const markAsFailed = async function ({ name }) {
  const result = await knex('review-apps')
    .update({ status: 'failure' })
    .where({ name })
    .returning(['repository', 'prNumber']);
  if (result.length === 0) {
    throw new Error(`${name} doesn't exist.`);
  }
  return result[0];
};

export const areAllDeployed = async function ({ repository, prNumber }) {
  const { count } = await knex('review-apps')
    .count()
    .where({ repository, prNumber })
    .whereNot('status', 'success')
    .whereNot('name', 'like', '%maddo%')
    .first();
  return count === 0;
};

export const remove = async function ({ name }) {
  return knex('review-apps').where({ name }).del();
};

export const listForPullRequest = async function ({ repository, prNumber }) {
  return knex.select('name', 'parentApp').from('review-apps').where({ repository, prNumber }).orderBy('parentApp');
};
