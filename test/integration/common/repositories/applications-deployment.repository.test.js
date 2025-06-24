import { expect } from '../../../test-helper.js';
import { knex } from '../../../../db/knex-database-connection.js';
import * as applicationsDeployment from '../../../../common/repositories/applications-deployment.repository.js';
import { config } from '../../../../config.js';
import { describe, beforeEach } from 'mocha';

describe('Integration | Common | Repositories | Applications deployment', function () {
  beforeEach(async function () {
    await knex('applications_deployments').del();
  });

  describe('#createVersion', function () {
    it('should create version and apps', async function () {
      // given
      const environment = 'local';
      const version = 'v1.0.0';

      // when
      await applicationsDeployment.createVersion({ environment, version });

      // then
      const result = await knex('applications_deployments').where({ environment, version });
      expect(result).to.have.length(config.PIX_APPS.length);
      config.PIX_APPS.map((app, index) => {
        expect(result[index]).to.deep.equal({
          version,
          environment,
          'app-name': `${result[index]['app-name']}`,
          'is-deployed': false,
          'deployed-at': null,
        });
      });
    });
  });

  describe('#markHasDeployed', function () {
    it('should mark an app has deployed', async function () {
      // given
      const data = {
        version: 'v1.0.0',
        'app-name': 'pix-app',
        environment: 'local',
      };
      await knex('applications_deployments').insert(data);

      // when
      await applicationsDeployment.markHasDeployed({ version: 'v1.0.0', environment: 'local', app: 'pix-app' });

      // then
      const result = await knex('applications_deployments').where(data).first();
      expect(result).to.deep.equal({
        ...data,
        'is-deployed': true,
        'deployed-at': result['deployed-at'],
      });
    });
  });

  describe('#getByVersionAndEnvironment', function () {
    it('should return deployments by version and environment', async function () {
      // given
      const data = [
        {
          version: 'v1.0.0',
          'app-name': 'pix-app',
          environment: 'local',
          'is-deployed': true,
          'deployed-at': new Date(),
        },
        {
          version: 'v1.0.0',
          'app-name': 'pix-app2',
          environment: 'local',
          'is-deployed': false,
          'deployed-at': null,
        },
      ];
      await knex('applications_deployments').insert(data);

      // when
      const result = await applicationsDeployment.getByVersionAndEnvironment({
        version: 'v1.0.0',
        environment: 'local',
      });

      // then
      expect(result).to.have.length(2);
      expect(result).to.deep.equal([
        {
          app: 'pix-app',
          isDeployed: true,
          deployedAt: result[0]['deployedAt'],
        },
        {
          app: 'pix-app2',
          isDeployed: false,
          deployedAt: null,
        },
      ]);
    });

    it('should return an empty list when version not found', async function () {
      // when
      const result = await applicationsDeployment.getByVersionAndEnvironment({
        version: 'v1.0.0',
        environment: 'local',
      });

      // then
      expect(result).to.have.length(0);
      expect(result).to.deep.equal([]);
    });
  });

  describe('#removeByVersionAndEnvironment', function () {
    it('should remove deployments by version and environment', async function () {
      // given
      const data = [
        {
          version: 'v1.0.0',
          'app-name': 'pix-app',
          environment: 'local',
          'is-deployed': true,
          'deployed-at': new Date(),
        },
        {
          version: 'v1.0.0',
          'app-name': 'pix-app2',
          environment: 'local',
          'is-deployed': false,
          'deployed-at': null,
        },
      ];
      await knex('applications_deployments').insert(data);

      // when
      await applicationsDeployment.removeByVersionAndEnvironment({
        version: 'v1.0.0',
        environment: 'local',
      });

      // then
      const result = await knex('applications_deployments').where({
        version: 'v1.0.0',
        environment: 'local',
      });
      expect(result).to.have.length(0);
    });
  });
});
