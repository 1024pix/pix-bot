const { expect, sinon, StatusCodes, createGithubWebhookSignatureHeader, nock } = require('../../test-helper');
const server = require('../../../server');
const config = require('../../../config');

describe('Acceptance | Build | Github', function () {
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

          const scalingoDeploy1 = getManualReviewAppNock({ appName: 'pix-api-review', prNumber: 2 });
          const scalingoDeploy2 = getManualReviewAppNock({ appName: 'pix-front-review', prNumber: 2 });
          const scalingoDeploy3 = getManualReviewAppNock({ appName: 'pix-audit-logger-review', prNumber: 2 });
          const scalingoUpdateOpts1 = getScmRepoLinkNock({ reviewAppName: 'pix-api-review-pr2' });
          const scalingoUpdateOpts2 = getScmRepoLinkNock({ reviewAppName: 'pix-front-review-pr2' });
          const scalingoUpdateOpts3 = getScmRepoLinkNock({ reviewAppName: 'pix-audit-logger-review-pr2' });
          const scalingoSCMDeploy2 = getManualDeployNock({ reviewAppName: 'pix-api-review-pr2' });
          const scalingoSCMDeploy1 = getManualDeployNock({ reviewAppName: 'pix-front-review-pr2' });
          const scalingoSCMDeploy3 = getManualDeployNock({ reviewAppName: 'pix-audit-logger-review-pr2' });

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
        const scalingoRAExists1 = getAppNock({ reviewAppName: 'pix-front-review-pr2' });
        const scalingoRAExists2 = getAppNock({ reviewAppName: 'pix-api-review-pr2' });
        const scalingoRAExists3 = getAppNock({ reviewAppName: 'pix-audit-logger-review-pr2' });

        const scalingoDeploy1 = getManualDeployNock({ reviewAppName: 'pix-front-review-pr2' });
        const scalingoDeploy2 = getManualDeployNock({ reviewAppName: 'pix-api-review-pr2' });
        const scalingoDeploy3 = getManualDeployNock({ reviewAppName: 'pix-audit-logger-review-pr2' });

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
        expect(scalingoRAExists1.isDone()).to.be.true;
        expect(scalingoRAExists2.isDone()).to.be.true;
        expect(scalingoRAExists3.isDone()).to.be.true;
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

      describe('when RA does not already exist', function () {
        it('responds with 200 and creates RA', async function () {
          const scalingoAuth = nock('https://auth.scalingo.com').post('/v1/tokens/exchange').reply(201);
          const scalingoRAExists1 = getAppNock({ reviewAppName: 'pix-front-review-pr2', returnCode: 404 });
          const scalingoRAExists2 = getAppNock({ reviewAppName: 'pix-api-review-pr2' });
          const scalingoRAExists3 = getAppNock({ reviewAppName: 'pix-audit-logger-review-pr2' });
          const scalingoCreate1 = getManualReviewAppNock({ appName: 'pix-front-review', prNumber: 2 });
          const scalingoUpdateOpts1 = getScmRepoLinkNock({ reviewAppName: 'pix-front-review-pr2' });

          const scalingoDeploy1 = getManualDeployNock({ reviewAppName: 'pix-front-review-pr2' });
          const scalingoDeploy2 = getManualDeployNock({ reviewAppName: 'pix-api-review-pr2' });
          const scalingoDeploy3 = getManualDeployNock({ reviewAppName: 'pix-audit-logger-review-pr2' });

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
          expect(scalingoRAExists2.isDone()).to.be.true;
          expect(scalingoRAExists3.isDone()).to.be.true;
          expect(scalingoRAExists1.isDone()).to.be.true;
          expect(scalingoDeploy2.isDone()).to.be.true;
          expect(scalingoDeploy3.isDone()).to.be.true;
          expect(scalingoCreate1.isDone()).to.be.true;
          expect(scalingoUpdateOpts1.isDone()).to.be.true;
          expect(scalingoDeploy1.isDone()).to.be.true;
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
