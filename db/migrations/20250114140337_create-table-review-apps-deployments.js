const TABLE_NAME = 'review-apps-deployments';

/**
 * @param {import("knex").Knex} knex
 * @returns {Promise<void>}
 */
export async function up(knex) {
  await knex.schema.createTable(TABLE_NAME, (table) => {
    table.string('appName', 255).notNullable().primary();
    table.string('scmRef', 255).notNullable();
    table.datetime('after').notNullable();
  });
}

/**
 * @param {import("knex").Knex} knex
 * @returns {Promise<void>}
 */
export async function down(knex) {
  await knex.schema.dropTable(TABLE_NAME);
}
