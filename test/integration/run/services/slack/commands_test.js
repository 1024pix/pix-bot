const commands = require('../../../../../run/services/slack/commands');
const { expect, nock } = require('../../../../test-helper');

describe('Integration | Run | Services | Slack | Commands', function () {
  describe('#deployPixAPIM', function () {
    it('should call Scalingo API to deploy the main branch', async function () {
      const scalingoTokenNock = nock(`https://auth.scalingo.com`).post('/v1/tokens/exchange').reply(200, {});

      const deploymentPayload = {
        deployment: {
          git_ref: 'main',
          source_url: 'https://undefined@github.com/github-owner/pix-nginx-apim/archive/main.tar.gz',
        },
      };
      const nockDeploys = nock('https://scalingo.production')
        .post(`/v1/apps/pix-nginx-apim-production/deployments`, deploymentPayload)
        .reply(200, {});

      await commands.deployPixAPIM();

      expect(scalingoTokenNock.isDone()).to.be.true;

      expect(nockDeploys.isDone()).to.be.true;
    });
  });

  describe('#deployGeoAPI', function () {
    it('should call Scalingo API to deploy the main branch', async function () {
      const scalingoTokenNock = nock(`https://auth.scalingo.com`).post('/v1/tokens/exchange').reply(200, {});

      const deploymentPayload = {
        deployment: {
          git_ref: 'main',
          source_url: 'https://undefined@github.com/github-owner/geoapi/archive/main.tar.gz',
        },
      };
      const nockDeploy = nock('https://scalingo.production')
        .post(`/v1/apps/pix-geoapi-production/deployments`, deploymentPayload)
        .reply(200, {});

      await commands.deployGeoAPI();

      expect(scalingoTokenNock.isDone()).to.be.true;
      expect(nockDeploy.isDone()).to.be.true;
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
        .post(`/v1/apps/pix-360-production/deployments`, deploymentPayload)
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

  describe('#deployDBT', function () {
    it('should call Scalingo API to deploy a specified tag', async function () {
      const scalingoTokenNock = nock(`https://auth.scalingo.com`).post('/v1/tokens/exchange').reply(200, {});
      const dbtVersion = 'v0.0.1';
      const deploymentPayload = {
        branch: dbtVersion,
      };

      const commandPayload = {
        text: dbtVersion,
      };

      const nockCallA = nock('https://scalingo.production')
        .post(`/v1/apps/pix-dbt-production/scm_repo_link/manual_deploy`, deploymentPayload)
        .reply(200, {});
      const nockCallB = nock('https://scalingo.production')
        .post(`/v1/apps/pix-dbt-external-production/scm_repo_link/manual_deploy`, deploymentPayload)
        .reply(200, {});

      await commands.deployDBT(commandPayload);

      expect(scalingoTokenNock.isDone()).to.be.true;
      expect(nockCallA.isDone()).to.be.true;
      expect(nockCallB.isDone()).to.be.true;
    });
  });
});
