const { expect, createSlackWebhookSignatureHeaders } = require('../../test-helper');
const server = require('../../../server');

describe('Acceptance | Run | SlashCommand', function () {
  describe('POST /slack/commands/deploy-metabase', function () {
    it('responds with 200', async function () {
      const body = {};
      const res = await server.inject({
        method: 'POST',
        url: '/slack/commands/deploy-metabase',
        headers: createSlackWebhookSignatureHeaders(JSON.stringify(body)),
        payload: body,
      });
      expect(res.statusCode).to.equal(200);
      expect(res.result.text).to.equal('Commande de déploiement de Metabase en production bien reçue.');
    });
  });
});
