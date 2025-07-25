const TABLE_NAME = 'review-apps';
const COLUMN_NAME = 'status';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const up = async function (knex) {
  await knex.schema.alterTable(TABLE_NAME, (table) => {
    table.string(COLUMN_NAME, 15).notNullable().defaultTo('pending');
  });
  await knex(TABLE_NAME).where({ isDeployed: false }).update({ status: 'failure' });
  await knex(TABLE_NAME).where({ isDeployed: true }).update({ status: 'success' });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const down = async function (knex) {
  await knex.schema.alterTable(TABLE_NAME, (table) => {
    table.dropColumn(COLUMN_NAME);
  });
};

export { up, down };
