const TABLE_NAME = 'review-apps';
const COLUMN_NAME = 'lastDeploymentId';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.alterTable(TABLE_NAME, (table) => {
    table.string(COLUMN_NAME).nullable();
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.alterTable(TABLE_NAME, (table) => {
    table.dropColumn(COLUMN_NAME);
  });
}
