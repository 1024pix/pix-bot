/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const up = function (knex) {
  return knex.schema.createTable('pull_requests', (table) => {
    table.integer('number').notNullable();
    table.string('repositoryName').notNullable();
    table.boolean('isMerging').defaultTo(false);
    table.dateTime('createdAt').notNullable().defaultTo(knex.fn.now());
    table.unique(['repositoryName', 'number']);
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
