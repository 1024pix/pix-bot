import { expect, sinon } from '../../../test-helper.js';
import { knex } from '../../../../db/knex-database-connection.js';
import * as applicationsDeploymentService from '../../../../common/services/applications-deployment.service.js';
import { config } from '../../../../config.js';
import slackPostMessageService from '../../../../common/services/slack/surfaces/messages/post-message.js';

describe('Integration | Common | Services | Applications deployment', function () {
  const version = 'v1.0.0';
  const environment = 'local';

  beforeEach(async function () {
    await knex('applications_deployments').del();
  });

  describe('#addNewVersion', function () {
    it('should add a new version successfull', async function () {
      // when
      await applicationsDeploymentService.addNewVersion({ environment, version });

      // then
      const result = await knex('applications_deployments').where({ environment, version });
      expect(result).to.have.length(config.PIX_APPS.length);
      config.PIX_APPS.map((app, index) => {
        expect(result[index]).to.deep.equal({
          version,
          environment,
          'app-name': result[index]['app-name'],
          'is-deployed': false,
          'deployed-at': null,
        });
      });
    });

    it('should not create version if always exists', async function () {
      // given
      for (const application of config.PIX_APPS) {
        await knex('applications_deployments').insert({
          version,
          environment,
          'app-name': application,
        });
      }
      await knex('applications_deployments').where({ 'app-name': 'pix-app' }).update({ 'is-deployed': true });

      // when
      await applicationsDeploymentService.addNewVersion({ environment, version });

      // then
      const result = await knex('applications_deployments').where({ environment, version });
      expect(result).to.have.length(config.PIX_APPS.length);
      const pixApp = await knex('applications_deployments')
        .where({ environment, version, 'app-name': 'pix-app' })
        .first();
      expect(pixApp['is-deployed']).to.be.true;
    });
  });

  describe('#markAppHasDeployed', function () {
    it('should mark app deployed', async function () {
      // given
      for (const application of config.PIX_APPS) {
        await knex('applications_deployments').insert({
          environment,
          version,
          'app-name': application,
        });
      }
      sinon.stub(slackPostMessageService, 'postMessage');

      // when
      await applicationsDeploymentService.markAppHasDeployed({ app: config.PIX_APPS[0], environment, version });

      // then
      const app = await knex('applications_deployments')
        .where({ environment, version, 'app-name': config.PIX_APPS[0] })
        .first();
      expect(app['is-deployed']).to.be.true;
      expect(slackPostMessageService.postMessage).to.not.have.been.called;
    });

    it('should send notification when all applications are deployed', async function () {
      // given
      for (const application of config.PIX_APPS) {
        await knex('applications_deployments').insert({
          environment,
          version,
          'app-name': application,
          'is-deployed': true,
        });
      }
      await knex('applications_deployments')
        .where({ environment, version, 'app-name': config.PIX_APPS[0] })
        .update({ 'is-deployed': false });
      sinon.stub(slackPostMessageService, 'postMessage');

      // when
      await applicationsDeploymentService.markAppHasDeployed({ app: config.PIX_APPS[0], environment, version });

      // then
      const app = await knex('applications_deployments')
        .where({ environment, version, 'app-name': config.PIX_APPS[0] })
        .first();
      expect(app['is-deployed']).to.be.true;
      expect(slackPostMessageService.postMessage).to.have.been.called;
    });
  });

  describe('#isPixApplication', function () {
    it('should return true if the applications is from PIX_APPS', function () {
      // given
      const applicationName = 'pix-app';

      // when
      const result = applicationsDeploymentService.isPixApplication(applicationName);

      // then
      expect(result).to.be.true;
    });

    it('should return false if the application is not from PIX_APPS', function () {
      // given
      const applicationName = 'som-application';

      // when
      const result = applicationsDeploymentService.isPixApplication(applicationName);

      // then
      expect(result).to.be.false;
    });
  });
});
