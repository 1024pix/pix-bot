const commands = require('../../../../../run/services/slack/commands');
const { expect, nock } = require('../../../../test-helper');

describe('Integration | Run | Services | Slack | Commands', function () {
  describe('#deployMetabase', function () {
    it('should call Scalingo API to deploy the master branch', async function () {
      const scalingoTokenNock = nock(`https://auth.scalingo.com`).post('/v1/tokens/exchange').reply(200, {});

      const deploymentPayload = {
        deployment: {
          git_ref: 'master',
          source_url: 'https://undefined@github.com/github-owner/metabase-deploy/archive/master.tar.gz',
        },
      };
      const scalingoDeployMetabaseProductionNock = nock('https://scalingo.production')
        .post('/v1/apps/pix-metabase-production/deployments', deploymentPayload)
        .reply(200, {});
      const scalingoDeployMetabaseDataNock = nock('https://scalingo.production')
        .post('/v1/apps/pix-data-metabase-production/deployments', deploymentPayload)
        .reply(200, {});

      await commands.deployMetabase();

      expect(scalingoTokenNock.isDone()).to.be.true;
      expect(scalingoDeployMetabaseProductionNock.isDone()).to.be.true;
      expect(scalingoDeployMetabaseDataNock.isDone()).to.be.true;
    });
  });

  describe('#deployGraviteeAPIM', function () {
    it('should call Scalingo API to deploy the main branch', async function () {
      const scalingoTokenNock = nock(`https://auth.scalingo.com`).post('/v1/tokens/exchange').reply(200, {});

      const deploymentPayload = {
        deployment: {
          git_ref: 'main',
          source_url: 'https://undefined@github.com/github-owner/pix-gravitee-apim/archive/main.tar.gz',
        },
      };
      const nockDeploys = [
        'pix-gravitee-apim-portal-ui-production',
        'pix-gravitee-apim-gateway-production',
        'pix-gravitee-apim-console-ui-production',
        'pix-gravitee-apim-rest-api-production',
      ].map((app) => {
        return nock('https://scalingo.production')
          .post(`/v1/apps/${app}/deployments`, deploymentPayload)
          .reply(200, {});
      });

      await commands.deployGraviteeAPIM();

      expect(scalingoTokenNock.isDone()).to.be.true;
      nockDeploys.forEach((nockCall) => {
        expect(nockCall.isDone()).to.be.true;
      });
    });
  });

  describe('#deployPix360', function () {
    it('should call Scalingo API to deploy the main branch', async function () {
      const scalingoTokenNock = nock(`https://auth.scalingo.com`).post('/v1/tokens/exchange').reply(200, {});

      const deploymentPayload = {
        deployment: {
          git_ref: 'main',
          source_url: 'https://undefined@github.com/github-owner/pix-360/archive/main.tar.gz',
        },
      };
      const nockDeploy = nock('https://scalingo.production')
        .post(`/v1/apps/pix-360/deployments`, deploymentPayload)
        .reply(200, {});

      await commands.deployPix360();

      expect(scalingoTokenNock.isDone()).to.be.true;
      expect(nockDeploy.isDone()).to.be.true;
    });
  });

  describe('#deployAirflow', function () {
    it('should call Scalingo API to deploy a specified tag', async function () {
      const scalingoTokenNock = nock(`https://auth.scalingo.com`).post('/v1/tokens/exchange').reply(200, {});
      const airflowVersion = 'v0.0.1';
      const deploymentPayload = {
        branch: airflowVersion,
      };

      const commandPayload = {
        text: airflowVersion,
      };

      const nockCall = nock('https://scalingo.production')
        .post(`/v1/apps/pix-airflow-production/scm_repo_link/manual_deploy`, deploymentPayload)
        .reply(200, {});

      await commands.deployAirflow(commandPayload);

      expect(scalingoTokenNock.isDone()).to.be.true;
      expect(nockCall.isDone()).to.be.true;
    });
  });
});
