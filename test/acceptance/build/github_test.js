const { expect } = require('chai');
const { createGithubWebhookSignatureHeader } = require('../../test-helper');
const server = require('../../../server');

describe('Acceptance | Build | Github', function() {
  describe('POST /github/webhook', function() {
    let body;

    beforeEach(() => {
      body = {
        action: 'opened',
        number: 2,
        pull_request: {
          url: 'https://api.github.com/repos/Codertocat/Hello-World/pulls/2'
        }
      };
    });

    it('responds with 200', async () => {
      const res = await server.inject({
        method: 'POST',
        url: '/github/webhook',
        headers: {
          ...createGithubWebhookSignatureHeader(JSON.stringify(body)),
          'x-github-event': 'pull_request'
        },
        payload: body,
      });
      expect(res.statusCode).to.equal(200);
    });

    it('responds with 401', async () => {
      const res = await server.inject({
        method: 'POST',
        url: '/github/webhook',
        headers: {
          'x-hub-signature-256': 'sha256=test',
          'x-github-event': 'pull_request'
        },
        payload: body,
      });
      expect(res.statusCode).to.equal(401);
    });
  });
});
