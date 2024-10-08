/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const up = function (knex) {
  return knex.schema.createTable('pull_requests', (table) => {
    table.integer('number').notNullable();
    table.string('repositoryName').notNullable();
    table.boolean('isCurrentlyMerge').defaultTo(false);
    table.dateTime('created_at').notNullable().defaultTo(knex.fn.now());
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const down = function (knex) {
  return knex.schema.dropTable('pull_requests');
};

export { up, down };
