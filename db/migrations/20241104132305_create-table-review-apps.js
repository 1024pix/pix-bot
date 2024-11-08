const up = async function (knex) {
  await knex.schema.createTable('review-apps', (t) => {
    t.string('name').notNullable().primary();
    t.string('repository').notNullable();
    t.integer('prNumber').notNullable();
    t.string('parentApp').notNullable();
    t.boolean('isDeployed').notNullable().defaultTo(false);
    t.dateTime('createdAt').notNullable().defaultTo(knex.fn.now());

    t.unique('name');
  });
};

const down = async function (knex) {
  await knex.schema.dropTable('review-apps');
};

export { up, down };
