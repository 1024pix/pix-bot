import { knex } from '../../db/knex-database-connection.js';

export const create = async function ({ name, repository, prNumber, parentApp }) {
  await knex('review-apps').insert({ name, repository, prNumber, parentApp }).onConflict('name').merge({
    createdAt: new Date(),
    status: 'pending',
  });
};

export async function setStatus({ name, status }) {
  const [result] = await knex('review-apps').update({ status }).where({ name }).returning(['repository', 'prNumber']);
  return result;
}

export const remove = async function ({ name }) {
  return knex('review-apps').where({ name }).del();
};

export const listForPullRequest = async function ({ repository, prNumber }) {
  return knex
    .select('name', 'parentApp', 'status')
    .from('review-apps')
    .where({ repository, prNumber })
    .orderBy('parentApp');
};
