const TABLE_NAME = 'applications_deployments';
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const up = async function (knex) {
  return await knex.schema.createTable(TABLE_NAME, function (table) {
    table.string('version').notNullable().comment('The version of application');
    table.string('environment').comment('The application environment');
    table.string('app-name').comment('The application name');
    table.boolean('is-deployed').comment('Indicates if the application is deployed successfully').defaultTo(false);
    table.datetime('deployed-at').comment('The deployment date').defaultTo(null);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const down = async function (knex) {
  return await knex.schema.dropTableIfExists(TABLE_NAME);
};

export { up, down };
