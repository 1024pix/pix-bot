import { knex } from '../../db/knex-database-connection.js';

export const create = async function ({ name, repository, prNumber, parentApp }) {
  await knex('review-apps').insert({ name, repository, prNumber, parentApp });
};
