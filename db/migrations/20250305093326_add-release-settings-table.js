const TABLE_NAME = 'release-settings';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const up = async function (knex) {
  await knex.schema.createTable(TABLE_NAME, function (table) {
    table.string('repositoryName').notNullable().unique().comment('The name of repository for example pix-mono-repo');
    table
      .boolean('autorizeRecette')
      .defaultTo(true)
      .comment('Accept the deployment in the recette environment if using');
    table
      .boolean('autorizeProd')
      .defaultTo(true)
      .comment('Accept the deployment in the production environment if using');
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
