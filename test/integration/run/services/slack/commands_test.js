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
        'pix-apim-portal-ui-production',
        'pix-apim-gateway-production',
        'pix-apim-management-ui-production',
        'pix-apim-rest-api-production',
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
});
