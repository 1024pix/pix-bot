const TABLE_NAME = 'review-apps';

/**
 * @param {import("knex").Knex} knex
 * @returns {Promise<void>}
 */
export async function up(knex) {
  await knex.schema.alterTable(TABLE_NAME, (table) => {
    table.string('deployScmRef').nullable();
    table.datetime('deployAfter').nullable();
  });
}

/**
 * @param {import("knex").Knex} knex
 * @returns {Promise<void>}
 */
export async function down(knex) {
  await knex.schema.alterTable(TABLE_NAME, (table) => {
    table.dropColumn('deployScmRef');
    table.dropColumn('deployAfter');
  });
}
