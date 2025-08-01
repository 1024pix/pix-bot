import { knex } from '../../db/knex-database-connection.js';

export const create = async function ({ name, repository, prNumber, parentApp, deploymentId: lastDeploymentId }) {
  await knex('review-apps')
    .insert({ name, repository, prNumber, parentApp, lastDeploymentId })
    .onConflict('name')
    .merge({
      createdAt: new Date(),
      status: 'pending',
      lastDeploymentId,
    });
};

export async function get(name) {
  return knex
    .select('name', 'repository', 'prNumber', 'status', 'lastDeploymentId')
    .from('review-apps')
    .where({ name })
    .first();
}

export async function setStatusPending({ name, deploymentId }) {
  await knex('review-apps').update({ status: 'pending', lastDeploymentId: deploymentId }).where({ name });
}

export async function setStatusSettled({ name, status }) {
  await knex('review-apps').update({ status, lastDeploymentId: null }).where({ name });
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
