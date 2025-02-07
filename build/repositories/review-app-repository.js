import { knex } from '../../db/knex-database-connection.js';

export const create = async function ({ name, repository, prNumber, parentApp }) {
  await knex('review-apps').insert({ name, repository, prNumber, parentApp }).onConflict('name').merge({
    createdAt: new Date(),
    isDeployed: false,
  });
};

export const markAsDeployed = async function ({ name }) {
  const result = await knex('review-apps')
    .update({ isDeployed: true })
    .where({ name })
    .returning(['repository', 'prNumber']);
  if (result.length === 0) {
    throw new Error(`${name} doesn't exist.`);
  }
  return result[0];
};

export const markAsFailed = async function ({ name }) {
  const result = await knex('review-apps')
    .update({ isDeployed: false })
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
    .where({ repository, prNumber, isDeployed: false })
    .whereNot('name', 'like', '%maddo%')
    .first();
  return count === 0;
};
