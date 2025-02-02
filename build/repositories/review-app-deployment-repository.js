import { knex } from '../../db/knex-database-connection.js';

const TABLE_NAME = 'review-apps-deployments';

/**
 * @typedef {{
 *   appName: string
 *   scmRef: string
 *   after: Date
 * }} Deployment
 *
 * @typedef {import('knex').Knex} Knex
 */

/**
 * @param {Deployment} deployment
 * @returns {Promise<void>}
 */
export async function save({ appName, scmRef, after }) {
  await knex.insert({ appName, scmRef, after }).into(TABLE_NAME).onConflict('appName').merge();
}

/**
 * @param {string} appName
 * @param {Knex} knexConn
 * @returns {Promise<void>}
 */
export async function remove(appName, knexConn = knex) {
  await knexConn.delete().from(TABLE_NAME).where('appName', appName);
}

/**
 * @param {Knex} knexConn
 * @returns {Promise<Deployment[]>}
 */
export async function listForDeployment(knexConn = knex) {
  const deployments = await knexConn
    .select()
    .from(TABLE_NAME)
    .where('after', '<', knexConn.raw('NOW()'))
    .orderBy('after')
    .forUpdate();
  return deployments;
}
