const TABLE_NAME = 'release-settings';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const up = async function (knex) {
  await knex.schema.createTable(TABLE_NAME, function (table) {
    table.string('repositoryName').notNullable().comment('The name of repository for example pix-mono-repo');
    table.string('environment').notNullable().comment('The environment of the repository');
    table.boolean('authorizeDeployment').defaultTo(true).comment('Authorize deployment to the environment');
    table.string('blockReason').defaultTo(null).comment('The reason why deployment is blocked');
    table.dateTime('blockDate').comment('The date when deployment was blocked').defaultTo(null);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const down = async function (knex) {
  await knex.schema.dropTable(TABLE_NAME);
};

export { up, down };
