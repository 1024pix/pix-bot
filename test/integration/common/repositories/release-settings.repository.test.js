import * as releaseSettingsRepository from '../../../../common/repositories/release-settings.repository.js';
import { knex } from '../../../../db/knex-database-connection.js';
import { expect } from '../../../test-helper.js';
import { describe } from 'mocha';

const TABLE_NAME = 'release-settings';
describe('integration | repositories | action-active', function () {
  beforeEach(async function () {
    await knex(TABLE_NAME).delete();
  });

  describe('#addRepositoryName', function () {
    it('should insert element in table', async function () {
      // given
      const repositoryName = 'repository';

      // when
      await releaseSettingsRepository.addRepository(repositoryName);

      // then
      const expected = {
        repositoryName: repositoryName,
        autorizeRecette: true,
        autorizeProd: true,
      };
      const result = await knex(TABLE_NAME).select('*').where({ repositoryName }).first();
      expect(result).to.deep.equal(expected);
    });
  });

  describe('#updateRecette', () => {
    beforeEach(async function () {
      await knex(TABLE_NAME).insert({ repositoryName: 'repository' });
    });

    it('should update to false the recette autorization', async function () {
      // when
      await releaseSettingsRepository.updateRecette('repository', false);

      // then
      const expectedResult = {
        repositoryName: 'repository',
        autorizeRecette: false,
        autorizeProd: true,
      };
      const result = await knex(TABLE_NAME).select('*').where({ repositoryName: 'repository' }).first();
      expect(result).to.deep.equal(expectedResult);
    });
  });

  describe('#updateProduction', () => {
    beforeEach(async function () {
      await knex(TABLE_NAME).insert({ repositoryName: 'repository' });
    });

    it('should update the production to false', async function () {
      // when
      await releaseSettingsRepository.updateProduction('repository', false);

      // then
      const expectedResult = {
        repositoryName: 'repository',
        autorizeRecette: true,
        autorizeProd: false,
      };
      const result = await knex(TABLE_NAME).select('*').where({ repositoryName: 'repository' }).first();
      expect(result).to.deep.equal(expectedResult);
    });
  });

  describe('#getByRepository', () => {
    beforeEach(async function () {
      await knex(TABLE_NAME).insert({ repositoryName: 'repository' });
    });

    it('should display the repo state', async function () {
      // when
      const result = await releaseSettingsRepository.getByRepositoryName('repository');

      // then
      expect(result).to.deep.equal({
        repositoryName: 'repository',
        autorizeRecette: true,
        autorizeProd: true,
      });
    });
  });
});
