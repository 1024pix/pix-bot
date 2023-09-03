const commands = require('../../../../../run/services/slack/commands');
const { expect, nock } = require('../../../../test-helper');

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
});
