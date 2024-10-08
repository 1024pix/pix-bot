import { knex } from '../../db/knex-database-connection.js';

async function save({ number, repositoryName }) {
  return knex('pull_requests').insert({ number, repositoryName });
}

export { save };
