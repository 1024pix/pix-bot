const { expect, StatusCodes, createGithubWebhookSignatureHeader, nock } = require('../../test-helper');
const server = require('../../../server');

describe('Acceptance | Build | Github', function () {
  describe('POST /github/webhook', function () {
    let body;

    describe('on pull request opened event', function () {
      beforeEach(function () {
        body = {
          action: 'opened',
          number: 2,
          pull_request: {
            labels: [{ name: 'test-label' }],
            head: {
              repo: {
                name: 'pix',
                fork: false,
              },
            },
          },
        };
      });

      it('responds with 200 and create the RA on scalingo and disable autodeploy', async function () {
        const scalingoAuth = nock('https://auth.scalingo.com').post('/v1/tokens/exchange').reply(StatusCodes.OK);
        const replyBody1 = {
          review_app: {
            app_name: 'pix-front-review-pr2',
          },
        };
        const replyBody2 = {
          review_app: {
            app_name: 'pix-api-review-pr2',
          },
        };
        const scalingoDeploy1 = nock('https://api.osc-fr1.scalingo.com')
          .post('/v1/apps/pix-front-review/scm_repo_link/manual_review_app', { pull_request_id: 2 })
          .reply(StatusCodes.CREATED, replyBody1);
        const scalingoDeploy2 = nock('https://api.osc-fr1.scalingo.com')
          .post('/v1/apps/pix-api-review/scm_repo_link/manual_review_app', { pull_request_id: 2 })
          .reply(StatusCodes.CREATED, replyBody2);
        const scalingoUpdateOpts1 = nock('https://api.osc-fr1.scalingo.com')
          .patch('/v1/apps/pix-front-review-pr2/scm_repo_link', { scm_repo_link: { auto_deploy_enabled: false } })
          .reply(StatusCodes.CREATED);
        const scalingoUpdateOpts2 = nock('https://api.osc-fr1.scalingo.com')
          .patch('/v1/apps/pix-api-review-pr2/scm_repo_link', { scm_repo_link: { auto_deploy_enabled: false } })
          .reply(StatusCodes.CREATED);
        nock('https://api.github.com').post('/repos/github-owner/pix/issues/2/comments').reply(StatusCodes.OK);

        const res = await server.inject({
          method: 'POST',
          url: '/github/webhook',
          headers: {
            ...createGithubWebhookSignatureHeader(JSON.stringify(body)),
            'x-github-event': 'pull_request',
          },
          payload: body,
        });
        expect(res.statusCode).to.equal(StatusCodes.OK);
        expect(res.result).to.eql('Created RA on app pix-front-review, pix-api-review with pr 2');
        expect(scalingoAuth.isDone()).to.be.true;
        expect(scalingoDeploy1.isDone()).to.be.true;
        expect(scalingoDeploy2.isDone()).to.be.true;
        expect(scalingoUpdateOpts1.isDone()).to.be.true;
        expect(scalingoUpdateOpts2.isDone()).to.be.true;
      });

      it('responds with OK (200) and add application link to pull request comments', async function () {
        // given
        const replyBody1 = {
          review_app: {
            app_name: 'pix-front-review-pr2',
          },
        };
        const replyBody2 = {
          review_app: {
            app_name: 'pix-api-review-pr2',
          },
        };
        body.pull_request.labels = [];
        nock('https://auth.scalingo.com').post('/v1/tokens/exchange').reply(StatusCodes.CREATED);
        nock('https://api.osc-fr1.scalingo.com')
          .post('/v1/apps/pix-front-review/scm_repo_link/manual_review_app', { pull_request_id: 2 })
          .reply(StatusCodes.CREATED, replyBody1);
        nock('https://api.osc-fr1.scalingo.com')
          .post('/v1/apps/pix-api-review/scm_repo_link/manual_review_app', { pull_request_id: 2 })
          .reply(StatusCodes.CREATED, replyBody2);
        nock('https://api.osc-fr1.scalingo.com')
          .patch('/v1/apps/pix-front-review-pr2/scm_repo_link', { scm_repo_link: { auto_deploy_enabled: false } })
          .reply(StatusCodes.CREATED);
        nock('https://api.osc-fr1.scalingo.com')
          .patch('/v1/apps/pix-api-review-pr2/scm_repo_link', { scm_repo_link: { auto_deploy_enabled: false } })
          .reply(StatusCodes.CREATED);
        const githubNock = nock('https://api.github.com')
          .post('/repos/github-owner/pix/issues/2/comments')
          .reply(StatusCodes.OK);

        // when
        const response = await server.inject({
          method: 'POST',
          url: '/github/webhook',
          headers: {
            ...createGithubWebhookSignatureHeader(JSON.stringify(body)),
            'x-github-event': 'pull_request',
          },
          payload: body,
        });

        // then
        expect(response.statusCode).to.equal(StatusCodes.OK);
        expect(response.result).to.equal('Created RA on app pix-front-review, pix-api-review with pr 2');
        expect(githubNock.isDone()).to.be.true;
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

      it('responds with 200 and do nothing for a pr labelled with no-review-app', async function () {
        body.pull_request.labels = [{ name: 'no-review-app' }];
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

      context('when Scalingo API client throws an error', function () {
        it('responds with 500 internal error', async function () {
          const scalingoTokenNock = nock(`https://auth.scalingo.com`).post('/v1/tokens/exchange').reply(500, {
            error: "Internal error occured, we're on it!",
          });

          const body = {
            action: 'opened',
            text: 'app-1',
            pull_request: { labels: [], head: { repo: { name: 'pix-bot' } } },
          };

          const response = await server.inject({
            method: 'POST',
            url: '/github/webhook',
            headers: {
              ...createGithubWebhookSignatureHeader(JSON.stringify(body)),
              'x-github-event': 'pull_request',
            },
            payload: body,
          });

          expect(scalingoTokenNock.isDone()).to.be.true;
          expect(response.statusCode).to.equal(StatusCodes.INTERNAL_SERVER_ERROR);
          expect(response.result.message).to.equal('An internal server error occurred');
        });
      });
    });

    describe('on pull request synchronize event', function () {
      beforeEach(function () {
        body = {
          action: 'synchronize',
          number: 2,
          pull_request: {
            labels: [],
            head: {
              ref: 'my-branch',
              repo: {
                name: 'pix',
                fork: false,
              },
            },
          },
        };
      });

      it('responds with 200 and create a deployment on scalingo', async function () {
        const scalingoAuth = nock('https://auth.scalingo.com').post('/v1/tokens/exchange').reply(201);
        const scalingoDeploy1 = nock('https://api.osc-fr1.scalingo.com')
          .post('/v1/apps/pix-front-review-pr2/scm_repo_link/manual_deploy', { branch: 'my-branch' })
          .reply(200);
        const scalingoDeploy2 = nock('https://api.osc-fr1.scalingo.com')
          .post('/v1/apps/pix-api-review-pr2/scm_repo_link/manual_deploy', { branch: 'my-branch' })
          .reply(200);

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
        expect(res.result).to.eql('Triggered deployment of RA on app pix-front-review, pix-api-review with pr 2');
        expect(scalingoAuth.isDone()).to.be.true;
        expect(scalingoDeploy1.isDone()).to.be.true;
        expect(scalingoDeploy2.isDone()).to.be.true;
      });

      it("responds with 200 and doesn't trigger deployment when the PR is from a fork", async function () {
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

      it("responds with 200 and doesn't trigger deployment the RA on scalingo when the PR is not from a configured repo", async function () {
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

      it('responds with 200 and do nothing for a pr labelled with no-review-app', async function () {
        body.pull_request.labels = [{ name: 'no-review-app' }];
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
    });

    it('responds with 200 and do nothing for other event', async function () {
      body = {};
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

    it('responds with 401 on a bad signature', async function () {
      body = {};
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
