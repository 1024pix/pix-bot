const { expect } = require('chai');
const crypto = require('crypto');
const server = require('../../../server');
const config = require('../../../config');

function createSlackWebhookSignatureHeaders(body) {
  const timestamp = Date.now();
  const version = 'v0';
  const hmac = crypto.createHmac('sha256', config.slack.requestSigningSecret);
  hmac.update(`${version}:${timestamp}:${body}`);

  return {
    'x-slack-signature': version +'='+ hmac.digest('hex'),
    'x-slack-request-timestamp': timestamp
  };
}

describe('Acceptance | Common | Slack', function() {
  describe('POST /slack/interactive-endpoint', function() {
    it('responds with 204', async () => {
      const body = {
        type: 'view_closed'
      };
      const res = await server.inject({
        method: 'POST',
        url: '/slack/interactive-endpoint',
        headers: createSlackWebhookSignatureHeaders(JSON.stringify(body)),
        payload: body,
      });
      expect(res.statusCode).to.equal(204);
    });

    it('responds with 401', async () => {
      const body = {
        type: 'view_closed'
      };
      const res = await server.inject({
        method: 'POST',
        url: '/slack/interactive-endpoint',
        payload: body,
      });
      expect(res.statusCode).to.equal(401);
    });
  });
});
