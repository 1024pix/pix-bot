const TABLE_NAME = 'deployments';
const APPLICATIONS = ['pix-app', 'pix-orga', 'pix-admin', 'pix-certif', 'pix-junior', 'pix-audit-logger', 'pix-api'];
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const up = async function (knex) {
  return await knex.schema.createTable(TABLE_NAME, function (table) {
    table.string('tag').comment('Deployment tag, e.g., v1.0.0').primary();
    APPLICATIONS.map((application) => {
      table.boolean(application).defaultTo(false).comment(`The deployment of ${application}`);
    });
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const down = async function (knex) {
  return await knex.schema.dropTable(TABLE_NAME);
};

export { up, down };
