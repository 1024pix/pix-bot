const { expect, StatusCodes, createGithubWebhookSignatureHeader, nock } = require('../../test-helper');
const server = require('../../../server');
const { PIX_MONOREPO_APPS }= require('../../../config').scalingo;

describe('Acceptance | Build | Github', function () {
  describe('POST /github/webhook', function () {
    let body;
    ['opened', 'reopened'].forEach((action) => {
      describe(`on pull request ${action} event`, function () {
        beforeEach(function () {
          body = {
            action: action,
            number: 2,
            pull_request: {
              state: 'open',
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

        it('responds with 200, creates the RA on scalingo, disables autodeploy, pushes the git ref and comments the PR', async function () {
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
          const replyBody3 = {
            review_app: {
              app_name: 'pix-audit-logger-review-pr2',
            },
          };
          const scalingoDeploy1 = nock('https://api.osc-fr1.scalingo.com')
            .post('/v1/apps/pix-front-review/scm_repo_link/manual_review_app', { pull_request_id: 2 })
            .reply(StatusCodes.CREATED, replyBody1);
          const scalingoDeploy2 = nock('https://api.osc-fr1.scalingo.com')
            .post('/v1/apps/pix-api-review/scm_repo_link/manual_review_app', { pull_request_id: 2 })
            .reply(StatusCodes.CREATED, replyBody2);
          const scalingoDeploy3 = nock('https://api.osc-fr1.scalingo.com')
            .post('/v1/apps/pix-audit-logger-review/scm_repo_link/manual_review_app', { pull_request_id: 2 })
            .reply(StatusCodes.CREATED, replyBody3);
          const scalingoUpdateOpts1 = nock('https://api.osc-fr1.scalingo.com')
            .patch('/v1/apps/pix-front-review-pr2/scm_repo_link', { scm_repo_link: { auto_deploy_enabled: false } })
            .reply(StatusCodes.CREATED);
          const scalingoUpdateOpts2 = nock('https://api.osc-fr1.scalingo.com')
            .patch('/v1/apps/pix-api-review-pr2/scm_repo_link', { scm_repo_link: { auto_deploy_enabled: false } })
            .reply(StatusCodes.CREATED);
          const scalingoUpdateOpts3 = nock('https://api.osc-fr1.scalingo.com')
            .patch('/v1/apps/pix-audit-logger-review-pr2/scm_repo_link', {
              scm_repo_link: { auto_deploy_enabled: false },
            })
            .reply(StatusCodes.CREATED);
          const scalingoSCMDeploy1 = nock('https://api.osc-fr1.scalingo.com')
            .post('/v1/apps/pix-front-review-pr2/scm_repo_link/manual_deploy', { branch: 'my-branch' })
            .reply(200);
          const scalingoSCMDeploy2 = nock('https://api.osc-fr1.scalingo.com')
            .post('/v1/apps/pix-api-review-pr2/scm_repo_link/manual_deploy', { branch: 'my-branch' })
            .reply(200);
          const scalingoSCMDeploy3 = nock('https://api.osc-fr1.scalingo.com')
            .post('/v1/apps/pix-audit-logger-review-pr2/scm_repo_link/manual_deploy', {
              branch: 'my-branch',
            })
            .reply(200);
          const githubNock = nock('https://api.github.com')
            .post('/repos/github-owner/pix/issues/2/comments')
            .reply(StatusCodes.OK);

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
          expect(res.result).to.eql(
            'Created RA on app pix-api-review, pix-audit-logger-review, pix-front-review with pr 2',
          );
          expect(scalingoAuth.isDone()).to.be.true;
          expect(scalingoDeploy1.isDone()).to.be.true;
          expect(scalingoDeploy2.isDone()).to.be.true;
          expect(scalingoDeploy3.isDone()).to.be.true;
          expect(scalingoUpdateOpts1.isDone()).to.be.true;
          expect(scalingoUpdateOpts2.isDone()).to.be.true;
          expect(scalingoUpdateOpts3.isDone()).to.be.true;
          expect(scalingoSCMDeploy1.isDone()).to.be.true;
          expect(scalingoSCMDeploy2.isDone()).to.be.true;
          expect(scalingoSCMDeploy3.isDone()).to.be.true;
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

        describe('when Scalingo API client throws an error', function () {
          it('responds with 500 internal error', async function () {
            const scalingoTokenNock = nock(`https://auth.scalingo.com`).post('/v1/tokens/exchange').reply(500, {
              error: "Internal error occured, we're on it!",
            });

            const body = {
              action: 'opened',
              text: 'app-1',
              pull_request: { state: 'open', labels: [], head: { repo: { name: 'pix-bot' } } },
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
    });

    describe('on pull request synchronize event', function () {
      beforeEach(function () {
        body = {
          action: 'synchronize',
          number: 2,
          pull_request: {
            state: 'open',
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
        const scalingoDeploy3 = nock('https://api.osc-fr1.scalingo.com')
          .post('/v1/apps/pix-audit-logger-review-pr2/scm_repo_link/manual_deploy', { branch: 'my-branch' })
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
        expect(res.result).to.eql(
          'Triggered deployment of RA on app pix-api-review, pix-audit-logger-review, pix-front-review with pr 2',
        );
        expect(scalingoAuth.isDone()).to.be.true;
        expect(scalingoDeploy1.isDone()).to.be.true;
        expect(scalingoDeploy2.isDone()).to.be.true;
        expect(scalingoDeploy3.isDone()).to.be.true;
      });

      it("responds with 200 and doesn't trigger deployment when the PR state is not open", async function () {
        body.pull_request.state = 'closed';

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
        expect(res.result).to.eql('No RA for closed PR');
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

    describe('on pull request push event', function () {
      beforeEach(function () {
        body = {
          "ref": "refs/heads/main",
          "repository": {
            "name": "pix-bot",
            "full_name": "1024pix/pix-bot",
            "owner": {
              "name": "1024pix",
              "login": "1024pix",
            },
            "fork": false,
            "visibility": "public",
            "default_branch": "main",
            "master_branch": "main",
            "organization": "1024pix",
          },
        };
      });

      it.only('responds with 200 and deploys the integration branch on scalingo', async function () {
        const scalingoAuth = nock('https://auth.scalingo.com').post('/v1/tokens/exchange').reply(201);
        let scalingoDeployNocks=[];
        let expectedOutput="Triggered deployment of integration on";
        PIX_MONOREPO_APPS.forEach(application => {
          expectedOutput+=` pix-${application}-integration`;
        });
        const deployedArchive={
          git_ref: 'dev',
          source_url: `https://github.com/github-owner/github-repository/archive/dev.tar.gz`,
        }
        expectedOutput+=" for project Pix";
        console.log(PIX_MONOREPO_APPS);
        PIX_MONOREPO_APPS.forEach(application => {
          scalingoDeployNocks[application]=nock('https://api.osc-fr1.scalingo.com')
          .post(`/v1/apps/pix-${application}-integration/deployments`, deployedArchive)
          .reply(200); 
        });

        const res = await server.inject({
          method: 'POST',
          url: '/github/webhook',
          headers: {
            ...createGithubWebhookSignatureHeader(JSON.stringify(body)),
            'x-github-event': 'push',
          },
          payload: body,
        });

        expect(res.statusCode).to.equal(200);
        expect(scalingoAuth.isDone()).to.be.true;
        scalingoDeployNocks.forEach(nock => {
          expect(nock.isDone()).to.be.true;
        });

        expect(res.result).to.eql(expectedOutput);
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
