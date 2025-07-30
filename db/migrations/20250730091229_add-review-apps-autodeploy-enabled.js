const TABLE_NAME = 'review-apps';
const COLUMN_NAME = 'autodeployEnabled';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.alterTable(TABLE_NAME, (table) => {
    table.boolean(COLUMN_NAME).notNullable().defaultTo(true);
  });
  await knex(TABLE_NAME).update({ [COLUMN_NAME]: false });
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
