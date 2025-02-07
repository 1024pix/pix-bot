import { config } from '../../../config.js';
import server from '../../../server.js';
import { createGithubWebhookSignatureHeader, expect, nock, sinon, StatusCodes } from '../../test-helper.js';
import { knex } from '../../../db/knex-database-connection.js';

describe('Acceptance | Build | Github', function () {
  beforeEach(async function () {
    await knex('review-apps').truncate();
    await knex('pull_requests').truncate();
  });

  describe('POST /github/webhook', function () {
    function getAppNock({ reviewAppName, returnCode = StatusCodes.OK }) {
      let body = undefined;
      if (returnCode == StatusCodes.OK) {
        body = { app: { name: reviewAppName } };
      }
      return nock('https://scalingo.reviewApps').get(`/v1/apps/${reviewAppName}`).reply(returnCode, body);
    }

    function getManualReviewAppNock({ appName, prNumber, returnCode = StatusCodes.CREATED }) {
      let body = undefined;
      if (returnCode == StatusCodes.CREATED) {
        body = {
          review_app: {
            app_name: `${appName}-pr${prNumber}`,
          },
        };
      }
      return nock('https://scalingo.reviewApps')
        .post(`/v1/apps/${appName}/scm_repo_link/manual_review_app`, { pull_request_id: 2 })
        .reply(returnCode, body);
    }

    function getPullRequestNock({ repository, prNumber, sha }) {
      return nock('https://api.github.com')
        .get(`/repos/1024pix/${repository}/pulls/${prNumber}`)
        .reply(201, { head: { sha } });
    }

    function addRADeploymentCheckNock({ repository, sha, status }) {
      const body = {
        context: 'check-ra-deployment',
        state: status,
      };
      return nock('https://api.github.com')
        .post(`/repos/1024pix/${repository}/statuses/${sha}`, body)
        .reply(201, { started_at: new Date() });
    }

    function getManualDeployNock({ reviewAppName, branch = 'my-branch', returnCode = StatusCodes.OK }) {
      return nock('https://scalingo.reviewApps')
        .post(`/v1/apps/${reviewAppName}/scm_repo_link/manual_deploy`, { branch: branch })
        .reply(returnCode);
    }

    function getScmRepoLinkNock({ reviewAppName, returnCode = StatusCodes.CREATED }) {
      return nock('https://scalingo.reviewApps')
        .patch(`/v1/apps/${reviewAppName}/scm_repo_link`, { scm_repo_link: { auto_deploy_enabled: false } })
        .reply(returnCode);
    }

    function deleteReviewAppNock({ reviewAppName, returnCode = StatusCodes.NO_CONTENT }) {
      nock('https://scalingo.reviewApps')
        .delete(`/v1/apps/${reviewAppName}?current_name=${reviewAppName}`)
        .reply(returnCode);
    }

    function getMergeCheckStatusNock({ repositoryFullName }) {
      const prHeadCommit = 'sha1';
      nock('https://api.github.com')
        .get(`/repos/1024pix/pix/pulls/123`)
        .reply(200, { head: { sha: prHeadCommit } });

      return nock('https://api.github.com')
        .post(`/repos/${repositoryFullName}/statuses/${prHeadCommit}`)
        .reply(201, { started_at: '2024-01-01' });
    }

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

        it('responds with 200, creates the RA on scalingo, disables autodeploy, pushes the git ref, comments the PR and add the deployment check', async function () {
          const scalingoAuth = nock('https://auth.scalingo.com').post('/v1/tokens/exchange').reply(StatusCodes.OK);

          const scalingoDeploy1 = getManualReviewAppNock({ appName: 'pix-api-review', prNumber: 2 });
          const scalingoDeploy2 = getManualReviewAppNock({ appName: 'pix-front-review', prNumber: 2 });
          const scalingoDeploy3 = getManualReviewAppNock({ appName: 'pix-audit-logger-review', prNumber: 2 });
          const scalingoUpdateOpts1 = getScmRepoLinkNock({ reviewAppName: 'pix-api-review-pr2' });
          const scalingoUpdateOpts2 = getScmRepoLinkNock({ reviewAppName: 'pix-front-review-pr2' });
          const scalingoUpdateOpts3 = getScmRepoLinkNock({ reviewAppName: 'pix-audit-logger-review-pr2' });
          const scalingoSCMDeploy2 = getManualDeployNock({ reviewAppName: 'pix-api-review-pr2' });
          const scalingoSCMDeploy1 = getManualDeployNock({ reviewAppName: 'pix-front-review-pr2' });
          const scalingoSCMDeploy3 = getManualDeployNock({ reviewAppName: 'pix-audit-logger-review-pr2' });
          const getPullRequest = getPullRequestNock({ repository: 'pix', prNumber: 2, sha: 'my-sha' });
          const addRADeploymentCheck = addRADeploymentCheckNock({
            repository: 'pix',
            sha: 'my-sha',
            status: 'pending',
          });

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
            'Triggered deployment of RA on app pix-api-review, pix-api-maddo-review, pix-audit-logger-review, pix-front-review with pr 2',
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
          expect(getPullRequest.isDone()).to.be.true;
          expect(addRADeploymentCheck.isDone()).to.be.true;
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
        const scalingoRAExists1 = getAppNock({ reviewAppName: 'pix-front-review-pr2' });
        const scalingoRAExists2 = getAppNock({ reviewAppName: 'pix-api-review-pr2' });
        const scalingoRAExists3 = getAppNock({ reviewAppName: 'pix-audit-logger-review-pr2' });
        const scalingoRAExists4 = getAppNock({ reviewAppName: 'pix-api-maddo-review-pr2' });

        const scalingoDeploy1 = getManualDeployNock({ reviewAppName: 'pix-front-review-pr2' });
        const scalingoDeploy2 = getManualDeployNock({ reviewAppName: 'pix-api-review-pr2' });
        const scalingoDeploy3 = getManualDeployNock({ reviewAppName: 'pix-audit-logger-review-pr2' });
        const scalingoDeploy4 = getManualDeployNock({ reviewAppName: 'pix-api-maddo-review-pr2' });

        const getPullRequest = getPullRequestNock({ repository: 'pix', prNumber: 2, sha: 'my-sha' });
        const addRADeploymentCheck = addRADeploymentCheckNock({ repository: 'pix', sha: 'my-sha', status: 'pending' });

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
          'Triggered deployment of RA on app pix-api-review, pix-api-maddo-review, pix-audit-logger-review, pix-front-review with pr 2',
        );
        expect(scalingoAuth.isDone()).to.be.true;
        expect(scalingoRAExists1.isDone()).to.be.true;
        expect(scalingoRAExists2.isDone()).to.be.true;
        expect(scalingoRAExists3.isDone()).to.be.true;
        expect(scalingoRAExists4.isDone()).to.be.true;
        expect(scalingoDeploy1.isDone()).to.be.true;
        expect(scalingoDeploy2.isDone()).to.be.true;
        expect(scalingoDeploy3.isDone()).to.be.true;
        expect(scalingoDeploy4.isDone()).to.be.true;
        expect(getPullRequest.isDone()).to.be.true;
        expect(addRADeploymentCheck.isDone()).to.be.true;
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

      describe('when RA does not already exist', function () {
        it('responds with 200 and creates RA', async function () {
          const scalingoAuth = nock('https://auth.scalingo.com').post('/v1/tokens/exchange').reply(201);
          const scalingoRAExists1 = getAppNock({ reviewAppName: 'pix-front-review-pr2', returnCode: 404 });
          const scalingoRAExists2 = getAppNock({ reviewAppName: 'pix-api-review-pr2' });
          const scalingoRAExists3 = getAppNock({ reviewAppName: 'pix-audit-logger-review-pr2' });
          const scalingoCreate1 = getManualReviewAppNock({ appName: 'pix-front-review', prNumber: 2 });
          const getPullRequest = getPullRequestNock({ repository: 'pix', prNumber: 2, sha: 'my-sha' });
          const addRADeploymentCheck = addRADeploymentCheckNock({
            repository: 'pix',
            sha: 'my-sha',
            status: 'pending',
          });

          const scalingoUpdateOpts1 = getScmRepoLinkNock({ reviewAppName: 'pix-front-review-pr2' });

          const scalingoDeploy1 = getManualDeployNock({ reviewAppName: 'pix-front-review-pr2' });
          const scalingoDeploy2 = getManualDeployNock({ reviewAppName: 'pix-api-review-pr2' });
          const scalingoDeploy3 = getManualDeployNock({ reviewAppName: 'pix-audit-logger-review-pr2' });

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

          expect(res.statusCode).to.equal(200);
          expect(res.result).to.eql(
            'Triggered deployment of RA on app pix-api-review, pix-api-maddo-review, pix-audit-logger-review, pix-front-review with pr 2',
          );
          expect(scalingoAuth.isDone()).to.be.true;
          expect(scalingoRAExists2.isDone()).to.be.true;
          expect(scalingoRAExists3.isDone()).to.be.true;
          expect(scalingoRAExists1.isDone()).to.be.true;
          expect(scalingoDeploy2.isDone()).to.be.true;
          expect(scalingoDeploy3.isDone()).to.be.true;
          expect(scalingoCreate1.isDone()).to.be.true;
          expect(scalingoUpdateOpts1.isDone()).to.be.true;
          expect(scalingoDeploy1.isDone()).to.be.true;
          expect(getPullRequest.isDone()).to.be.true;
          expect(addRADeploymentCheck.isDone()).to.be.true;
        });
      });

      describe('when Scalingo auth API returns an error', function () {
        it('responds with 500 and throws an error', async function () {
          const scalingoAuth = nock('https://auth.scalingo.com')
            .post('/v1/tokens/exchange')
            .reply(StatusCodes.INTERNAL_SERVER_ERROR);

          const res = await server.inject({
            method: 'POST',
            url: '/github/webhook',
            headers: {
              ...createGithubWebhookSignatureHeader(JSON.stringify(body)),
              'x-github-event': 'pull_request',
            },
            payload: body,
          });

          expect(scalingoAuth.isDone()).to.be.true;
          expect(res.statusCode).to.equal(500);
          expect(res.result).to.eql({
            statusCode: 500,
            error: 'Internal Server Error',
            message: 'An internal server error occurred',
          });
        });
      });

      describe('when Scalingo deploy API returns an error', function () {
        describe('for every deployment', function () {
          it('responds with 200', async function () {
            const scalingoAuth = nock('https://auth.scalingo.com').post('/v1/tokens/exchange').reply(201);
            const scalingoRAExists1 = getAppNock({ reviewAppName: 'pix-front-review-pr2' });
            const scalingoRAExists2 = getAppNock({ reviewAppName: 'pix-api-review-pr2' });
            const scalingoRAExists3 = getAppNock({ reviewAppName: 'pix-audit-logger-review-pr2' });
            const scalingoRAExists4 = getAppNock({ reviewAppName: 'pix-api-maddo-review-pr2' });

            const getPullRequest = getPullRequestNock({ repository: 'pix', prNumber: 2, sha: 'my-sha' });

            const scalingoDeploy1 = getManualDeployNock({ reviewAppName: 'pix-front-review-pr2', returnCode: 500 });
            const scalingoDeploy2 = getManualDeployNock({ reviewAppName: 'pix-api-review-pr2', returnCode: 500 });
            const scalingoDeploy3 = getManualDeployNock({
              reviewAppName: 'pix-audit-logger-review-pr2',
              returnCode: 500,
            });
            const scalingoDeploy4 = getManualDeployNock({ reviewAppName: 'pix-api-maddo-review-pr2', returnCode: 500 });
            addRADeploymentCheckNock({ repository: 'pix', sha: 'my-sha', status: 'pending' });

            const res = await server.inject({
              method: 'POST',
              url: '/github/webhook',
              headers: {
                ...createGithubWebhookSignatureHeader(JSON.stringify(body)),
                'x-github-event': 'pull_request',
              },
              payload: body,
            });

            expect(scalingoAuth.isDone()).to.be.true;

            expect(scalingoRAExists1.isDone()).to.be.true;
            expect(scalingoRAExists2.isDone()).to.be.true;
            expect(scalingoRAExists3.isDone()).to.be.true;
            expect(scalingoRAExists4.isDone()).to.be.true;
            expect(scalingoDeploy1.isDone()).to.be.true;
            expect(scalingoDeploy2.isDone()).to.be.true;
            expect(scalingoDeploy3.isDone()).to.be.true;
            expect(scalingoDeploy4.isDone()).to.be.true;
            expect(getPullRequest.isDone()).to.be.true;

            expect(res.statusCode).to.equal(200);
            expect(res.result).to.eql(
              'Triggered deployment of RA on app pix-api-review, pix-api-maddo-review, pix-audit-logger-review, pix-front-review with pr 2',
            );
          });
        });

        it('responds with 200 and list every app deployed', async function () {
          const scalingoAuth = nock('https://auth.scalingo.com').post('/v1/tokens/exchange').reply(201);
          const scalingoRAExists1 = getAppNock({ reviewAppName: 'pix-front-review-pr2' });
          const scalingoRAExists2 = getAppNock({ reviewAppName: 'pix-api-review-pr2' });
          const scalingoRAExists3 = getAppNock({ reviewAppName: 'pix-audit-logger-review-pr2' });
          const scalingoRAExists4 = getAppNock({ reviewAppName: 'pix-api-maddo-review-pr2' });

          const scalingoDeploy1 = getManualDeployNock({ reviewAppName: 'pix-front-review-pr2', returnCode: 500 });
          const scalingoDeploy2 = getManualDeployNock({ reviewAppName: 'pix-api-review-pr2' });
          const scalingoDeploy3 = getManualDeployNock({
            reviewAppName: 'pix-audit-logger-review-pr2',
          });
          const scalingoDeploy4 = getManualDeployNock({ reviewAppName: 'pix-api-maddo-review-pr2' });
          const getPullRequest = getPullRequestNock({ repository: 'pix', prNumber: 2, sha: 'my-sha' });
          const addRADeploymentCheck = addRADeploymentCheckNock({
            repository: 'pix',
            sha: 'my-sha',
            status: 'pending',
          });

          const res = await server.inject({
            method: 'POST',
            url: '/github/webhook',
            headers: {
              ...createGithubWebhookSignatureHeader(JSON.stringify(body)),
              'x-github-event': 'pull_request',
            },
            payload: body,
          });

          expect(scalingoAuth.isDone()).to.be.true;
          expect(scalingoRAExists1.isDone()).to.be.true;
          expect(scalingoRAExists2.isDone()).to.be.true;
          expect(scalingoRAExists3.isDone()).to.be.true;
          expect(scalingoRAExists4.isDone()).to.be.true;
          expect(scalingoDeploy1.isDone()).to.be.true;
          expect(scalingoDeploy2.isDone()).to.be.true;
          expect(scalingoDeploy3.isDone()).to.be.true;
          expect(scalingoDeploy4.isDone()).to.be.true;
          expect(getPullRequest.isDone()).to.be.true;
          expect(addRADeploymentCheck.isDone()).to.be.true;
          expect(res.statusCode).to.equal(200);
          expect(res.result).to.eql(
            'Triggered deployment of RA on app pix-api-review, pix-api-maddo-review, pix-audit-logger-review, pix-front-review with pr 2',
          );
        });
      });
    });

    describe('on closed event', function () {
      it('it should delete existing review apps', async function () {
        // given
        nock('https://auth.scalingo.com').post('/v1/tokens/exchange').reply(StatusCodes.OK);
        getAppNock({ reviewAppName: 'pix-api-review-pr123', returnCode: StatusCodes.OK });
        getAppNock({ reviewAppName: 'pix-api-maddo-review-pr123', returnCode: StatusCodes.OK });
        getAppNock({ reviewAppName: 'pix-audit-logger-review-pr123', returnCode: StatusCodes.NOT_FOUND });
        getAppNock({ reviewAppName: 'pix-front-review-pr123', returnCode: StatusCodes.OK });
        deleteReviewAppNock({ reviewAppName: 'pix-api-review-pr123' });
        deleteReviewAppNock({ reviewAppName: 'pix-api-maddo-review-pr123' });
        deleteReviewAppNock({ reviewAppName: 'pix-audit-logger-review-pr123', returnCode: StatusCodes.NOT_FOUND });
        deleteReviewAppNock({ reviewAppName: 'pix-front-review-pr123' });

        body = {
          action: 'closed',
          number: 123,
          repository: {
            full_name: '1024pix/pix',
          },
          pull_request: {
            state: 'closed',
            head: {
              ref: 'my-branch',
              repo: {
                name: 'pix',
                fork: false,
              },
            },
            merged: false,
          },
        };

        getMergeCheckStatusNock({ repositoryFullName: body.repository.full_name });

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

        expect(response.payload).to.equal(
          'Closed RA for PR 123 : pix-api-review-pr123, pix-api-maddo-review-pr123, pix-audit-logger-review-pr123 (already closed), pix-front-review-pr123.',
        );
      });
    });

    describe('on labeled event', function () {
      beforeEach(function () {
        body = {
          action: 'labeled',
          number: 123,
          repository: {
            full_name: '1024pix/pix',
          },
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
          label: {
            name: 'another-label',
          },
        };
      });

      it('responds with 200 and do nothing without no-review-app label', async function () {
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
      });

      it('it should delete existing review apps if no-review-app has been set', async function () {
        // given
        body.label = { name: 'no-review-app' };
        nock('https://auth.scalingo.com').post('/v1/tokens/exchange').reply(StatusCodes.OK);
        getAppNock({ reviewAppName: 'pix-api-review-pr123', returnCode: StatusCodes.OK });
        getAppNock({ reviewAppName: 'pix-audit-logger-review-pr123', returnCode: StatusCodes.NOT_FOUND });
        getAppNock({ reviewAppName: 'pix-front-review-pr123', returnCode: StatusCodes.OK });
        deleteReviewAppNock({ reviewAppName: 'pix-api-review-pr123' });
        deleteReviewAppNock({ reviewAppName: 'pix-audit-logger-review-pr123', returnCode: StatusCodes.NOT_FOUND });
        deleteReviewAppNock({ reviewAppName: 'pix-front-review-pr123' });

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

        expect(response.statusCode).equal(200);
      });

      describe('when label is `ready-to-merge`', function () {
        it('should save pull request and call action', async function () {
          const body = {
            action: 'labeled',
            number: 123,
            repository: {
              full_name: '1024pix/pix',
            },
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
            label: {
              name: ':rocket: Ready to Merge',
            },
            sender: {
              login: 'foo',
            },
          };
          const workflowRepoName = config.github.automerge.repositoryName;
          const workflowId = config.github.automerge.workflowId;
          const workflowRef = config.github.automerge.workflowRef;

          sinon.stub(config.github.automerge, 'allowedRepositories').value(['1024pix/pix']);

          const checkUserBelongsToPixNock = nock('https://api.github.com')
            .get(`/orgs/1024pix/members/${body.sender.login}`)
            .reply(204);

          const callGitHubAction = nock('https://api.github.com/')
            .post(`/repos/${workflowRepoName}/actions/workflows/${workflowId}/dispatches`, {
              ref: workflowRef,
              inputs: { pullRequest: `1024pix/pix/${body.number}` },
            })
            .reply(200, {});

          const mergeCheckNock = getMergeCheckStatusNock({ repositoryFullName: body.repository.full_name });

          const response = await server.inject({
            method: 'POST',
            url: '/github/webhook',
            headers: {
              ...createGithubWebhookSignatureHeader(JSON.stringify(body)),
              'x-github-event': 'pull_request',
            },
            payload: body,
          });

          expect(checkUserBelongsToPixNock.isDone()).to.be.true;
          expect(callGitHubAction.isDone()).to.be.true;
          expect(mergeCheckNock.isDone()).to.be.true;
          expect(response.statusCode).equal(200);
        });

        it('should save pull request and do not call action when they are already merging pull request', async function () {
          const body = {
            action: 'labeled',
            number: 123,
            repository: {
              full_name: '1024pix/pix',
            },
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
            label: {
              name: ':rocket: Ready to Merge',
            },
            sender: {
              login: 'foo',
            },
          };
          const workflowRepoName = config.github.automerge.repositoryName;
          const workflowId = config.github.automerge.workflowId;
          const workflowRef = config.github.automerge.workflowRef;

          sinon.stub(config.github.automerge, 'allowedRepositories').value(['1024pix/pix']);

          const checkUserBelongsToPixNock = nock('https://api.github.com')
            .get(`/orgs/1024pix/members/${body.sender.login}`)
            .reply(204)
            .persist();

          const callGitHubAction = nock('https://api.github.com/')
            .post(`/repos/${workflowRepoName}/actions/workflows/${workflowId}/dispatches`, {
              ref: workflowRef,
              inputs: { pullRequest: `1024pix/pix/${body.number}` },
            })
            .reply(200, {});

          const prHeadCommit = 'aaaa';
          nock('https://api.github.com')
            .get(`/repos/1024pix/pix/pulls/123`)
            .reply(200, { head: { sha: prHeadCommit } })
            .persist();

          nock('https://api.github.com')
            .post(`/repos/${body.repository.full_name}/statuses/${prHeadCommit}`)
            .reply(201, { started_at: '2024-01-01' });

          const secondPRForSameRepo = 567;
          const shouldNotBeCalled = nock('https://api.github.com/')
            .post(`/repos/${workflowRepoName}/actions/workflows/${workflowId}/dispatches`, {
              ref: workflowRef,
              inputs: { pullRequest: `1024pix/pix/${secondPRForSameRepo}` },
            })
            .reply(200, {});

          await server.inject({
            method: 'POST',
            url: '/github/webhook',
            headers: {
              ...createGithubWebhookSignatureHeader(JSON.stringify(body)),
              'x-github-event': 'pull_request',
            },
            payload: body,
          });

          expect(checkUserBelongsToPixNock.isDone()).to.be.true;
          expect(callGitHubAction.isDone()).to.be.true;

          // when
          body.number = secondPRForSameRepo;
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
          expect(shouldNotBeCalled.isDone()).to.be.false;
          expect(response.statusCode).to.equal(200);
          const secondPR = await knex('pull_requests').where({ repositoryName: '1024pix/pix', number: 567 }).first();
          expect(secondPR.isMerging).to.be.false;
        });
      });
    });

    describe('on push event', function () {
      describe('on the default branch', function () {
        it('responds with 200 and deploys the corresponding integration applications', async function () {
          // given
          sinon.stub(config.scalingo, 'repositoryToScalingoIntegration').value({
            'pix-repo': ['pix-front1-integration', 'pix-front2-integration', 'pix-api-integration'],
          });
          const default_branch = 'default_branch_name';
          const branch = 'default_branch_name';
          const scalingoDeploymentPayload = {
            deployment: {
              git_ref: 'default_branch_name',
              source_url: 'https://undefined@github.com/github-owner/pix-repo/archive/default_branch_name.tar.gz',
            },
          };
          nock('https://auth.scalingo.com').post('/v1/tokens/exchange').reply(201);
          const scalingoDeployFront1 = nock('https://scalingo.integration')
            .post('/v1/apps/pix-front1-integration/deployments', scalingoDeploymentPayload)
            .reply(200);
          const scalingoDeployFront2 = nock('https://scalingo.integration')
            .post('/v1/apps/pix-front2-integration/deployments', scalingoDeploymentPayload)
            .reply(200);
          const scalingoDeployApi = nock('https://scalingo.integration')
            .post('/v1/apps/pix-api-integration/deployments', scalingoDeploymentPayload)
            .reply(200);

          const body = {
            ref: `refs/heads/${branch}`,
            repository: {
              name: 'pix-repo',
              full_name: '1024pix/pix-repo',
              owner: {
                name: '1024pix',
                login: '1024pix',
              },
              fork: false,
              visibility: 'public',
              default_branch,
              master_branch: 'main',
              organization: '1024pix',
            },
          };

          //when
          const res = await server.inject({
            method: 'POST',
            url: '/github/webhook',
            headers: {
              ...createGithubWebhookSignatureHeader(JSON.stringify(body)),
              'x-github-event': 'push',
            },
            payload: body,
          });

          // then
          expect(res.statusCode).to.equal(200);
          expect(res.result).to.equal(
            'Deploying branch default_branch_name on integration applications : pix-front1-integration, pix-front2-integration, pix-api-integration',
          );
          expect(scalingoDeployFront1.isDone()).to.be.true;
          expect(scalingoDeployFront2.isDone()).to.be.true;
          expect(scalingoDeployApi.isDone()).to.be.true;
        });

        describe('when scalingo returns an error during deployment', function () {
          it('responds with 500', async function () {
            // given
            sinon.stub(config.scalingo, 'repositoryToScalingoIntegration').value({
              'pix-repo': ['pix-front1-integration', 'pix-front2-integration', 'pix-api-integration'],
            });
            const default_branch = 'default_branch_name';
            const branch = 'default_branch_name';
            const scalingoDeploymentPayload = {
              deployment: {
                git_ref: 'default_branch_name',
                source_url: 'https://undefined@github.com/github-owner/pix-repo/archive/default_branch_name.tar.gz',
              },
            };
            nock('https://auth.scalingo.com').post('/v1/tokens/exchange').reply(201);
            const scalingoDeployFront1 = nock('https://scalingo.integration')
              .post('/v1/apps/pix-front1-integration/deployments', scalingoDeploymentPayload)
              .reply(200);
            const scalingoDeployFront2 = nock('https://scalingo.integration')
              .post('/v1/apps/pix-front2-integration/deployments', scalingoDeploymentPayload)
              .reply(500, { message: 'error' });
            const scalingoDeployApi = nock('https://scalingo.integration')
              .post('/v1/apps/pix-api-integration/deployments', scalingoDeploymentPayload)
              .reply(200);

            const body = {
              ref: `refs/heads/${branch}`,
              repository: {
                name: 'pix-repo',
                full_name: '1024pix/pix-repo',
                owner: {
                  name: '1024pix',
                  login: '1024pix',
                },
                fork: false,
                visibility: 'public',
                default_branch,
                master_branch: 'main',
                organization: '1024pix',
              },
            };

            //when
            const res = await server.inject({
              method: 'POST',
              url: '/github/webhook',
              headers: {
                ...createGithubWebhookSignatureHeader(JSON.stringify(body)),
                'x-github-event': 'push',
              },
              payload: body,
            });

            // then
            expect(res.statusCode).to.equal(StatusCodes.INTERNAL_SERVER_ERROR);
            expect(res.result.message).to.equal('An internal server error occurred');
            expect(scalingoDeployFront1.isDone()).to.be.true;
            expect(scalingoDeployFront2.isDone()).to.be.true;
            expect(scalingoDeployApi.isDone()).to.be.false;
          });
        });
      });

      describe('on any branch but the default one', function () {
        it('responds with 200 and do nothing', async function () {
          // when
          const default_branch = 'main';
          const branch = 'pushedBranch';

          const body = {
            ref: `refs/heads/${branch}`,
            repository: {
              name: 'pix-repo',
              full_name: '1024pix/pix-repo',
              owner: {
                name: '1024pix',
                login: '1024pix',
              },
              fork: false,
              visibility: 'public',
              default_branch,
              master_branch: 'main',
              organization: '1024pix',
            },
          };
          const res = await server.inject({
            method: 'POST',
            url: '/github/webhook',
            headers: {
              ...createGithubWebhookSignatureHeader(JSON.stringify(body)),
              'x-github-event': 'push',
            },
            payload: body,
          });
          // then
          expect(res.statusCode).to.equal(200);
          expect(res.result).to.equal('Ignoring push event on branch pushedBranch as it is not the default branch');
        });
      });

      describe('on a unconfigured repository', function () {
        it('responds with 200 and do nothing', async function () {
          // when
          sinon.stub(config.scalingo, 'repositoryToScalingoIntegration').value({
            repository: ['pix-front1-integration', 'pix-front2-integration', 'pix-api-integration'],
          });
          const repositoryName = 'not-configured-repository';

          const body = {
            ref: `refs/heads/main`,
            repository: {
              name: repositoryName,
              full_name: '1024pix/${repositoryName}',
              owner: {
                name: '1024pix',
                login: '1024pix',
              },
              fork: false,
              visibility: 'public',
              default_branch: 'main',
              master_branch: 'main',
              organization: '1024pix',
            },
          };
          const res = await server.inject({
            method: 'POST',
            url: '/github/webhook',
            headers: {
              ...createGithubWebhookSignatureHeader(JSON.stringify(body)),
              'x-github-event': 'push',
            },
            payload: body,
          });
          // then
          expect(res.statusCode).to.equal(200);
          expect(res.result).to.equal(
            'Ignoring push event on repository not-configured-repository as it is not configured',
          );
        });
      });
    });

    describe('on check_suite event', function () {
      describe('when action is not handled', function () {
        it('should do nothing and return ignoring message', async function () {
          const body = {
            action: 'requested',
            repository: {
              full_name: '1024pix/pix',
            },
            check_suite: {},
          };
          const response = await server.inject({
            method: 'POST',
            url: '/github/webhook',
            headers: {
              ...createGithubWebhookSignatureHeader(JSON.stringify(body)),
              'x-github-event': 'check_suite',
            },
            payload: body,
          });

          expect(response.statusCode).equal(200);
          expect(response.payload).equal(`Ignoring 'requested' action for check_suite event`);
        });
      });

      describe('when action is completed', function () {
        it('should do merge queue tasks and return message', async function () {
          const body = {
            action: 'completed',
            repository: {
              full_name: '1024pix/pix',
            },
            check_suite: {
              conclusion: 'failure',
              pull_requests: [
                {
                  number: 123,
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
              ],
            },
          };
          getMergeCheckStatusNock({ repositoryFullName: body.repository.full_name });

          const response = await server.inject({
            method: 'POST',
            url: '/github/webhook',
            headers: {
              ...createGithubWebhookSignatureHeader(JSON.stringify(body)),
              'x-github-event': 'check_suite',
            },
            payload: body,
          });

          expect(response.statusCode).equal(200);
          expect(response.payload).equal('check_suite event handle');
        });
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
