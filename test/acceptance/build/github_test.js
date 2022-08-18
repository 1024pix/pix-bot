const { expect } = require('chai');
const { createGithubWebhookSignatureHeader, nock } = require('../../test-helper');
const server = require('../../../server');

describe('Acceptance | Build | Github', function () {
  describe('POST /github/webhook', function () {
    let body;

    beforeEach(function () {
      body = {
        action: 'opened',
        number: 2,
        pull_request: {
          title: '[TECH] Pr n2',
          head: {
            repo: {
              name: 'pix',
              fork: false,
            },
          },
        },
      };
    });

    it('responds with 200 and create the RA on scalingo', async function () {
      const scalingoAuth = nock('https://auth.scalingo.com').post('/v1/tokens/exchange').reply(201);
      const scalingoDeploy1 = nock('https://api.osc-fr1.scalingo.com')
        .post('/v1/apps/pix-front-review/scm_repo_link/manual_review_app', { pull_request_id: 2 })
        .reply(201);
      const scalingoDeploy2 = nock('https://api.osc-fr1.scalingo.com')
        .post('/v1/apps/pix-api-review/scm_repo_link/manual_review_app', { pull_request_id: 2 })
        .reply(201);

      const res = await server.inject({
        method: 'POST',
        url: '/github/webhook',
        headers: {
          ...createGithubWebhookSignatureHeader(JSON.stringify(body)),
          'x-github-event': 'pull_request',
        },
        payload: body,
      });
      expect(res.statusCode).to.equal(200);
      expect(res.result).to.eql('Created RA on app pix-front-review, pix-api-review with pr 2');
      expect(scalingoAuth.isDone()).to.be.true;
      expect(scalingoDeploy1.isDone()).to.be.true;
      expect(scalingoDeploy2.isDone()).to.be.true;
    });

    it("responds with 200 and doesn't create the RA on scalingo when the PR is from a fork", async function () {
      body.pull_request.head.repo.fork = true;

      const res = await server.inject({
        method: 'POST',
        url: '/github/webhook',
        headers: {
          ...createGithubWebhookSignatureHeader(JSON.stringify(body)),
          'x-github-event': 'pull_request',
        },
        payload: body,
      });
      expect(res.statusCode).to.equal(200);
      expect(res.result).to.eql('No RA for a fork');
    });

    it("responds with 200 and doesn't create the RA on scalingo when the PR is not from a configured repo", async function () {
      body.pull_request.head.repo.name = 'pix-repository-that-dont-exist';

      const res = await server.inject({
        method: 'POST',
        url: '/github/webhook',
        headers: {
          ...createGithubWebhookSignatureHeader(JSON.stringify(body)),
          'x-github-event': 'pull_request',
        },
        payload: body,
      });
      expect(res.statusCode).to.equal(200);
      expect(res.result).to.eql('No RA configured for this repository');
    });

    it('responds with 200 and do nothing for other action on pull request', async function () {
      body.action = 'edited';

      const res = await server.inject({
        method: 'POST',
        url: '/github/webhook',
        headers: {
          ...createGithubWebhookSignatureHeader(JSON.stringify(body)),
          'x-github-event': 'pull_request',
        },
        payload: body,
      });
      expect(res.statusCode).to.equal(200);
      expect(res.result).to.eql('Ignoring edited action');
    });

    it('responds with 200 and do nothing for a pr with nora in title', async function () {
      body.pull_request.title = '[TECH][NORA] Pr n2';
      const res = await server.inject({
        method: 'POST',
        url: '/github/webhook',
        headers: {
          ...createGithubWebhookSignatureHeader(JSON.stringify(body)),
          'x-github-event': 'pull_request',
        },
        payload: body,
      });
      expect(res.statusCode).to.equal(200);
      expect(res.result).to.eql('RA disabled for this PR');
    });

    it('responds with 200 and do nothing for other event', async function () {
      const res = await server.inject({
        method: 'POST',
        url: '/github/webhook',
        headers: {
          ...createGithubWebhookSignatureHeader(JSON.stringify(body)),
          'x-github-event': 'deployment',
        },
        payload: body,
      });
      expect(res.statusCode).to.equal(200);
      expect(res.result).to.eql('Ignoring deployment event');
    });

    it('responds with 401', async function () {
      const res = await server.inject({
        method: 'POST',
        url: '/github/webhook',
        headers: {
          'x-hub-signature-256': 'sha256=test',
          'x-github-event': 'pull_request',
        },
        payload: body,
      });
      expect(res.statusCode).to.equal(401);
    });
  });
});
