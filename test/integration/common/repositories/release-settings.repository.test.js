import * as releaseSettingsRepository from '../../../../common/repositories/release-settings.repository.js';
import { knex } from '../../../../db/knex-database-connection.js';
import { expect, sinon } from '../../../test-helper.js';
import { describe } from 'mocha';

const TABLE_NAME = 'release-settings';
describe('integration | repositories | action-active', function () {
  beforeEach(async function () {
    await knex(TABLE_NAME).delete();
  });

  describe('#getStatus', function () {
    it('should return the status when is ok', async function () {
      // given
      const repositoryName = 'repository-name';
      const environment = 'production';
      await knex(TABLE_NAME).insert({ repositoryName, environment });

      // when
      const status = await releaseSettingsRepository.getStatus({ repositoryName, environment });

      // then
      expect(status).to.deep.equal({
        repositoryName,
        environment,
        authorizeDeployment: true,
        blockReason: null,
        blockDate: null,
      });
    });

    it('should return the status when is not ok', async function () {
      // given
      const repositoryName = 'repository-name';
      const environment = 'production';
      const authorizeDeployment = false;
      const blockReason = 'block-reason';
      const blockDate = new Date();
      await knex(TABLE_NAME).insert({ repositoryName, environment, authorizeDeployment, blockReason, blockDate });

      // when
      const status = await releaseSettingsRepository.getStatus({ repositoryName, environment });

      // then
      expect(status).to.deep.equal({ repositoryName, environment, authorizeDeployment, blockReason, blockDate });
    });
  });

  describe('#updateStatus', () => {
    it('should update the status of deployment authorization', async function () {
      // given
      const repositoryName = 'repository-name';
      const environment = 'production';
      const authorizeDeployment = false;
      const blockReason = 'block-reason';
      const blockDate = new Date();
      await knex(TABLE_NAME).insert({ repositoryName, environment, authorizeDeployment, blockReason, blockDate });

      // when
      await releaseSettingsRepository.updateStatus({ repositoryName, environment, authorizeDeployment: true });

      // then
      const status = await knex(TABLE_NAME).where({ repositoryName, environment }).first();
      expect(status).to.deep.equal({
        repositoryName,
        environment,
        authorizeDeployment: true,
        blockReason: null,
        blockDate: null,
      });
    });

    it('should update status and refuse deployment', async function () {
      // given
      // stub Date class
      const now = new Date();
      sinon.useFakeTimers(now);
      const repositoryName = 'repository-name';
      const environment = 'production';
      const authorizeDeployment = true;
      await knex(TABLE_NAME).insert({ repositoryName, environment, authorizeDeployment });

      // when
      await releaseSettingsRepository.updateStatus({
        repositoryName,
        environment,
        authorizeDeployment: false,
        reason: 'block-reason',
      });

      // then
      const status = await knex(TABLE_NAME).where({ repositoryName, environment }).first();
      expect(status).to.deep.equal({
        repositoryName,
        environment,
        authorizeDeployment: false,
        blockReason: 'block-reason',
        blockDate: new Date(),
      });
    });
  });
});
