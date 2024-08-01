import * as commands from '../../../../../run/services/slack/commands.js';
import { expect, nock } from '../../../../test-helper.js';

describe('Integration | Run | Services | Slack | Commands', function () {
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

  describe('#deployPixDataApiPix', function () {
    it('should call Scalingo API to deploy a specified tag', async function () {
      const scalingoTokenNock = nock(`https://auth.scalingo.com`).post('/v1/tokens/exchange').reply(200, {});
      const pixDataApiPixVersion = 'v0.0.1';
      const deploymentPayload = {
        branch: pixDataApiPixVersion,
      };

      const commandPayload = {
        text: pixDataApiPixVersion,
      };

      const nockCall = nock('https://scalingo.production')
        .post(`/v1/apps/pix-data-api-pix-production/scm_repo_link/manual_deploy`, deploymentPayload)
        .reply(200, {});

      await commands.deployPixDataApiPix(commandPayload);

      expect(scalingoTokenNock.isDone()).to.be.true;
      expect(nockCall.isDone()).to.be.true;
    });
  });
});
