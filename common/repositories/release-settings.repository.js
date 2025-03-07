import { knex } from '../../db/knex-database-connection.js';

const TABLE_NAME = 'release-settings';
async function addRepository(repositoryName) {
  return knex(TABLE_NAME).insert({ repositoryName });
}

async function updateRecette(repositoryName, autorization) {
  return knex(TABLE_NAME).where({ repositoryName }).update({ autorizeRecette: autorization });
}

async function updateProduction(repositoryName, autorization) {
  return knex(TABLE_NAME).where({ repositoryName }).update({ autorizeProd: autorization });
}

async function getByRepositoryName(repositoryName) {
  return knex(TABLE_NAME).where({ repositoryName }).first();
}

export { addRepository, updateRecette, updateProduction, getByRepositoryName };
