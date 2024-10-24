import Knex from 'knex';
import _ from 'lodash';
import pg from 'pg';

import { config } from '../config.js';
import * as knexConfigs from './knexfile.js';

const types = pg.types;

/*
By default, node-postgres casts a DATE value (PostgreSQL type) as a Date Object (JS type).
But, when dealing with dates with no time (such as birthdate for example), we want to
deal with a 'YYYY-MM-DD' string.
*/
types.setTypeParser(types.builtins.DATE, value => value);

/*
The method Bookshelf.Model.count(), used with PostgreSQL, can sometimes returns a BIGINT.
This is not the common case (maybe in several years).
Even though, Bookshelf/Knex have decided to return String.
We decided to parse the result of #count() method to force a resulting INTEGER.

Links :
- problem: https://github.com/bookshelf/bookshelf/issues/1275
- solution: https://github.com/brianc/node-pg-types
 */
types.setTypeParser(types.builtins.INT8, value => Number.parseInt(value));

const { environment } = config;

const knexConfig = knexConfigs.default[environment];
const configuredKnex = Knex(knexConfig);

async function disconnect() {
  return configuredKnex.destroy();
}

const _dbSpecificQueries = {
  listTablesQuery:
    'SELECT table_name FROM information_schema.tables WHERE table_schema = current_schema() AND table_catalog = ?',
  emptyTableQuery: 'TRUNCATE ',
};

async function listAllTableNamesOfDatabase() {
  const databaseName = configuredKnex.client.database();
  const bindings = [databaseName];
  const resultSet = await configuredKnex.raw(
    'SELECT table_name FROM information_schema.tables WHERE table_schema = current_schema() AND table_catalog = ?',
    bindings,
  );

  const rows = resultSet.rows;
  return _.map(rows, 'table_name');
}

async function emptyAllTablesOfDatabase() {
  const tableNames = await listAllTableNamesOfDatabase();
  const tablesToDelete = _.without(
    tableNames,
    'knex_migrations',
    'knex_migrations_lock',
    'view-active-organization-learners',
  );

  const tables = _.map(
    tablesToDelete,
    tableToDelete => `"${tableToDelete}"`,
  ).join();

  const query = _dbSpecificQueries.emptyTableQuery;
  return configuredKnex.raw(`${query}${tables}`);
}

export {
  configuredKnex as knex,
  disconnect,
  emptyAllTablesOfDatabase,
};
