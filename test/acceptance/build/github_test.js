import { config } from '../../../config.js';
import server from '../../../server.js';
import { createGithubWebhookSignatureHeader, expect, nock, sinon, StatusCodes } from '../../test-helper.js';
import { knex } from '../../../db/knex-database-connection.js';

const COMMENT = `Choisir les applications à déployer :

- [X] [API](https://api-pr123.review.pix.fr/api/) | [👩‍💻 Dashboard Scalingo](https://dashboard.scalingo.com/apps/osc-fr1/pix-api-review-pr123/environment) <!-- pix-api-review -->
- [ ] [App (.fr)](https://app-pr123.review.pix.fr) – [App (.org)](https://app-pr123.review.pix.org) | [👩‍💻 Dashboard Scalingo](https://dashboard.scalingo.com/apps/osc-fr1/pix-app-review-pr123/environment) <!-- pix-app-review -->
- [ ] [Orga (.fr)](https://orga-pr123.review.pix.fr) – [Orga (.org)](https://orga-pr123.review.pix.org) | [👩‍💻 Dashboard Scalingo](https://dashboard.scalingo.com/apps/osc-fr1/pix-orga-review-pr123/environment) <!-- pix-orga-review -->
- [ ] [Certif (.fr)](https://certif-pr123.review.pix.fr) – [Certif (.org)](https://certif-pr123.review.pix.org) | [👩‍💻 Dashboard Scalingo](https://dashboard.scalingo.com/apps/osc-fr1/pix-certif-review-pr123/environment) <!-- pix-certif-review -->
- [ ] [Junior](https://junior-pr123.review.pix.fr) | [👩‍💻 Dashboard Scalingo](https://dashboard.scalingo.com/apps/osc-fr1/pix-junior-review-pr123/environment) <!-- pix-junior-review -->
- [ ] [Admin](https://admin-pr123.review.pix.fr) | [👩‍💻 Dashboard Scalingo](https://dashboard.scalingo.com/apps/osc-fr1/pix-admin-review-pr123/environment) <!-- pix-admin-review -->
- [ ] [API MaDDo](https://pix-api-maddo-review-pr123.osc-fr1.scalingo.io/api/) | [👩‍💻 Dashboard Scalingo](https://dashboard.scalingo.com/apps/osc-fr1/pix-api-maddo-review-pr123/environment) <!-- pix-api-maddo-review -->
- [ ] [Audit Logger](https://pix-audit-logger-review-pr123.osc-fr1.scalingo.io/api/) | [👩‍💻 Dashboard Scalingo](https://dashboard.scalingo.com/apps/osc-fr1/pix-audit-logger-review-pr123/environment) <!-- pix-audit-logger-review -->

> [!IMPORTANT]
> N'oubliez pas de déployer l'API pour pouvoir accéder aux fronts et/ou à l’API MaDDo.
`;

describe('Acceptance | Build | Github', function () {
  beforeEach(async function () {
    await knex('review-apps').truncate();
    await knex('pull_requests').truncate();
  });

  describe('POST /github/webhook', function () {
    describe('when conditions are not met', function () {
      describe('when the pull request is from a fork', function () {
        it('responds with 200 and do nothing', async function () {
          // given
          const body = {
            action: 'opened',
            number: 2,
            pull_request: {
              state: 'open',
              labels: [],
              head: {
                ref: 'my-branch',
                repo: {
                  name: 'pix',
                  fork: true,
                },
              },
            },
          };

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
          expect(response.statusCode).to.equal(200);
          expect(response.result).to.eql('No RA for a fork');
        });
      });

      describe('when the pull request is not from a configured repo', function () {
        it('responds with 200 and do nothing', async function () {
          // given
          const body = {
            action: 'opened',
            number: 2,
            pull_request: {
              labels: [],
              state: 'open',
              head: {
                ref: 'my-branch',
                repo: {
                  name: 'pix-repository-that-dont-exist',
                  fork: false,
                },
              },
            },
          };

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
          expect(response.statusCode).to.equal(200);
          expect(response.result).to.eql('No RA configured for this repository');
        });
      });

      describe('when an action is not handle by pix-bot', function () {
        it('responds with 200 and do nothing', async function () {
          // given
          const body = {
            action: 'edited',
            number: 2,
            pull_request: {
              labels: [],
              state: 'open',
              head: {
                ref: 'my-branch',
                repo: {
                  name: 'pix',
                  fork: false,
                },
              },
            },
          };

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
          expect(response.statusCode).to.equal(200);
          expect(response.result).to.eql('Ignoring edited action');
        });
      });

      describe('when the pull request state is not open', function () {
        it('responds with 200 and do nothing', async function () {
          // given
          const body = {
            action: 'reopened',
            number: 2,
            pull_request: {
              labels: [],
              state: 'closed',
              head: {
                ref: 'my-branch',
                repo: {
                  name: 'pix',
                  fork: false,
                },
              },
            },
          };

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
          expect(response.statusCode).to.equal(200);
          expect(response.result).to.eql('No RA for closed PR');
        });
      });

      describe('when the event is not handle by pix-bot', function () {
        it('responds with 200 and do nothing', async function () {
          // given
          const body = {
            action: 'synchronize',
            number: 2,
            pull_request: {
              labels: [],
              state: 'open',
              head: {
                ref: 'my-branch',
                repo: {
                  name: 'pix',
                  fork: false,
                },
              },
            },
          };

          // when
          const response = await server.inject({
            method: 'POST',
            url: '/github/webhook',
            headers: {
              ...createGithubWebhookSignatureHeader(JSON.stringify(body)),
              'x-github-event': 'deployment',
            },
            payload: body,
          });

          // then
          expect(response.statusCode).to.equal(200);
          expect(response.result).to.eql('Ignoring deployment event');
        });
      });

      it('responds with 401 on a bad signature', async function () {
        // given
        // when
        const response = await server.inject({
          method: 'POST',
          url: '/github/webhook',
          headers: {
            'x-hub-signature-256': 'sha256=test',
            'x-github-event': 'pull_request',
          },
          payload: {},
        });

        // then
        expect(response.statusCode).to.equal(401);
      });

      describe('when Scalingo API client throws an error', function () {
        it('responds with 500 internal error', async function () {
          const scalingoTokenNock = nock(`https://auth.scalingo.com`).post('/v1/tokens/exchange').reply(500, {
            error: "Internal error occured, we're on it!",
          });
          const body = {
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
              labels: [],
            },
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

    describe('when conditions are met', function () {
      describe(`on pull request opened event`, function () {
        it('responds with 200, comments the PR', async function () {
          // given
          const body = {
            action: 'opened',
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
          const createComment = createPullRequestCommentNock({ repository: 'pix', prNumber: 2 });
          const getPullRequest = getPullRequestNock({ repository: 'pix', prNumber: 2, sha: 'my-sha' });
          const addRADeploymentCheck = addRADeploymentCheckNock({
            repository: 'pix',
            sha: 'my-sha',
            status: 'success',
          });

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
          expect(response.result).to.eql('Commented on PR 2 in repository pix');
          expect(createComment.isDone()).to.be.true;
          expect(getPullRequest.isDone()).to.be.true;
          expect(addRADeploymentCheck.isDone()).to.be.true;
        });
      });

      describe(`on pull request synchronize event`, function () {
        it('responds with 200, deploy pull request review apps', async function () {
          // given
          const body = {
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
          const scalingoAuth = nock('https://auth.scalingo.com').post('/v1/tokens/exchange').reply(StatusCodes.OK);
          await knex('review-apps').insert({
            name: 'pix-front-review-pr2',
            repository: 'pix',
            prNumber: 2,
            parentApp: 'pix-front-review',
          });
          const scalingoDeploy = deployReviewAppNock({ reviewAppName: 'pix-front-review-pr2' });
          const getPullRequest = getPullRequestNock({ repository: 'pix', prNumber: 2, sha: 'my-sha' });
          const addRADeploymentCheck = addRADeploymentCheckNock({
            repository: 'pix',
            sha: 'my-sha',
            status: 'pending',
          });

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
          expect(response.result).to.eql('Deployed on PR 2 in repository pix');
          expect(scalingoAuth.isDone()).to.be.true;
          expect(scalingoDeploy.isDone()).to.be.true;
          expect(getPullRequest.isDone()).to.be.true;
          expect(addRADeploymentCheck.isDone()).to.be.true;
        });
      });

      describe(`on pull request reopened event`, function () {
        it('responds with 200, edit pull request comment', async function () {
          // given
          const body = {
            action: 'reopened',
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
          const getComment = getPullRequestCommentNock({ repository: 'pix', prNumber: 2 });
          const editComment = editPullRequestCommentNock({ repository: 'pix', commentId: 1 });
          const getPullRequest = getPullRequestNock({ repository: 'pix', prNumber: 2, sha: 'my-sha' });
          const addRADeploymentCheck = addRADeploymentCheckNock({
            repository: 'pix',
            sha: 'my-sha',
            status: 'success',
          });

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
          expect(response.result).to.eql('Comment updated on reopened PR 2 in repository pix');
          expect(getComment.isDone()).to.be.true;
          expect(editComment.isDone()).to.be.true;
          expect(getPullRequest.isDone()).to.be.true;
          expect(addRADeploymentCheck.isDone()).to.be.true;
        });
      });

      describe(`on issue comment edited event`, function () {
        describe(`when no review apps exists`, function () {
          it('responds with 200, create and deploy pull request review apps, add deployment check and disabled Scalingo deploy auto', async function () {
            // given
            const bodyComment = COMMENT;
            const body = {
              action: 'edited',
              head: {
                ref: 'my-branch',
              },
              repository: {
                full_name: '1024pix/pix',
              },
              issue: {
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
              },
              comment: {
                body: bodyComment,
                user: {
                  login: 'pix-bot-github',
                },
              },
            };
            const getPullRequest = getPullRequestNock({ repository: 'pix', prNumber: 2, sha: 'my-sha', state: 'open' });
            const scalingoAuth = nock('https://auth.scalingo.com').post('/v1/tokens/exchange').reply(StatusCodes.OK);
            const createApi = createReviewAppNock({ appName: 'pix-api-review', prNumber: 2 });
            const disableAutoDeployApi = disableAutoDeployNock({ reviewAppName: 'pix-api-review-pr2' });
            const deployApi = deployReviewAppNock({ reviewAppName: 'pix-api-review-pr2' });
            const addRADeploymentCheck = addRADeploymentCheckNock({
              repository: 'pix',
              sha: 'my-sha',
              status: 'pending',
            });

            // when
            const response = await server.inject({
              method: 'POST',
              url: '/github/webhook',
              headers: {
                ...createGithubWebhookSignatureHeader(JSON.stringify(body)),
                'x-github-event': 'issue_comment',
              },
              payload: body,
            });

            // then
            expect(response.statusCode).to.equal(StatusCodes.OK);
            expect(response.result).to.eql('Created review apps: pix-api-review-pr2');
            expect(getPullRequest.isDone()).to.be.true;
            expect(scalingoAuth.isDone()).to.be.true;
            expect(createApi.isDone()).to.be.true;
            expect(disableAutoDeployApi.isDone()).to.be.true;
            expect(deployApi.isDone()).to.be.true;
            expect(addRADeploymentCheck.isDone()).to.be.true;
          });
        });

        describe(`when an existing review app is unchecked`, function () {
          it('responds with 200, remove pull request review apps, add deployment check', async function () {
            // given
            const bodyComment = COMMENT;
            const body = {
              action: 'edited',
              head: {
                ref: 'my-branch',
              },
              repository: {
                full_name: '1024pix/pix',
              },
              issue: {
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
              },
              comment: {
                body: bodyComment,
                user: {
                  login: 'pix-bot-github',
                },
              },
            };

            await knex('review-apps').insert({
              name: 'pix-certif-review-pr2',
              repository: 'pix',
              prNumber: 2,
              parentApp: 'pix-certif-review',
            });
            await knex('review-apps').insert({
              name: 'pix-api-review-pr2',
              repository: 'pix',
              prNumber: 2,
              parentApp: 'pix-api-review',
            });
            const getPullRequest = getPullRequestNock({ repository: 'pix', prNumber: 2, sha: 'my-sha', state: 'open' });
            const scalingoAuth = nock('https://auth.scalingo.com').post('/v1/tokens/exchange').reply(StatusCodes.OK);
            getAppNock({ reviewAppName: 'pix-api-review-pr2', returnCode: StatusCodes.OK });
            getAppNock({ reviewAppName: 'pix-certif-review-pr2', returnCode: StatusCodes.OK });
            deleteReviewAppNock({ reviewAppName: 'pix-certif-review-pr2' });
            const addRADeploymentCheck = addRADeploymentCheckNock({
              repository: 'pix',
              sha: 'my-sha',
              status: 'pending',
            });

            // when
            const response = await server.inject({
              method: 'POST',
              url: '/github/webhook',
              headers: {
                ...createGithubWebhookSignatureHeader(JSON.stringify(body)),
                'x-github-event': 'issue_comment',
              },
              payload: body,
            });

            // then
            const reviewApps = await knex('review-apps');
            expect(reviewApps.length).is.equal(1);
            expect(reviewApps[0].name).is.equal('pix-api-review-pr2');
            expect(response.statusCode).to.equal(StatusCodes.OK);
            expect(response.result).to.eql('Removed review apps: pix-certif-review-pr2');
            expect(getPullRequest.isDone()).to.be.true;
            expect(scalingoAuth.isDone()).to.be.true;
            expect(addRADeploymentCheck.isDone()).to.be.true;
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
          deleteReviewAppNock({ reviewAppName: 'pix-front-review-pr123' });

          const body = {
            action: 'closed',
            number: 123,
            repository: {
              full_name: '1024pix/pix',
            },
            pull_request: {
              state: 'open',
              head: {
                ref: 'my-branch',
                repo: {
                  name: 'pix',
                  fork: false,
                },
              },
              merged: false,
              labels: [],
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

          expect(nock.isDone()).to.be.true;

          expect(response.payload).to.equal(
            'Closed RA for PR 123 : pix-api-review-pr123, pix-front-review-pr123, pix-app-review-pr123 (already closed), pix-orga-review-pr123 (already closed), pix-certif-review-pr123 (already closed), pix-junior-review-pr123 (already closed), pix-admin-review-pr123 (already closed), pix-api-maddo-review-pr123, pix-audit-logger-review-pr123 (already closed).',
          );
        });
      });

      describe('on labeled event', function () {
        describe('when label is `ready-to-merge`', function () {
          it('should save pull request and call action', async function () {
            // given
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
            expect(checkUserBelongsToPixNock.isDone()).to.be.true;
            expect(callGitHubAction.isDone()).to.be.true;
            expect(mergeCheckNock.isDone()).to.be.true;
            expect(nock.isDone()).to.be.true;
            expect(response.statusCode).equal(200);
          });

          it('should save pull request and do not call action when they are already merging pull request', async function () {
            // given
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

            // when
            await server.inject({
              method: 'POST',
              url: '/github/webhook',
              headers: {
                ...createGithubWebhookSignatureHeader(JSON.stringify(body)),
                'x-github-event': 'pull_request',
              },
              payload: body,
            });

            // then
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
            const response = await server.inject({
              method: 'POST',
              url: '/github/webhook',
              headers: {
                ...createGithubWebhookSignatureHeader(JSON.stringify(body)),
                'x-github-event': 'push',
              },
              payload: body,
            });

            // then
            expect(response.statusCode).to.equal(200);
            expect(response.result).to.equal(
              'Deploying branch default_branch_name on integration applications : pix-front1-integration, pix-front2-integration, pix-api-integration',
            );
            expect(scalingoDeployFront1.isDone()).to.be.true;
            expect(scalingoDeployFront2.isDone()).to.be.true;
            expect(scalingoDeployApi.isDone()).to.be.true;
            expect(nock.isDone()).to.be.true;
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
              const response = await server.inject({
                method: 'POST',
                url: '/github/webhook',
                headers: {
                  ...createGithubWebhookSignatureHeader(JSON.stringify(body)),
                  'x-github-event': 'push',
                },
                payload: body,
              });

              // then
              expect(response.statusCode).to.equal(StatusCodes.INTERNAL_SERVER_ERROR);
              expect(response.result.message).to.equal('An internal server error occurred');
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

            // when
            const response = await server.inject({
              method: 'POST',
              url: '/github/webhook',
              headers: {
                ...createGithubWebhookSignatureHeader(JSON.stringify(body)),
                'x-github-event': 'push',
              },
              payload: body,
            });

            // then
            expect(response.statusCode).to.equal(200);
            expect(response.result).to.equal(
              'Ignoring push event on branch pushedBranch as it is not the default branch',
            );
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
            const response = await server.inject({
              method: 'POST',
              url: '/github/webhook',
              headers: {
                ...createGithubWebhookSignatureHeader(JSON.stringify(body)),
                'x-github-event': 'push',
              },
              payload: body,
            });
            // then
            expect(response.statusCode).to.equal(200);
            expect(response.result).to.equal(
              'Ignoring push event on repository not-configured-repository as it is not configured',
            );
          });
        });
      });

      describe('on check_suite event', function () {
        describe('when action is not handled', function () {
          it('should do nothing and return ignoring message', async function () {
            // given
            const body = {
              action: 'requested',
              repository: {
                full_name: '1024pix/pix',
              },
              check_suite: {
                pull_requests: [],
              },
            };

            // when
            const response = await server.inject({
              method: 'POST',
              url: '/github/webhook',
              headers: {
                ...createGithubWebhookSignatureHeader(JSON.stringify(body)),
                'x-github-event': 'check_suite',
              },
              payload: body,
            });

            // then
            expect(response.statusCode).equal(200);
            expect(response.payload).equal(`Ignoring 'requested' action for check_suite event`);
          });
        });

        describe('when action is completed', function () {
          it('should do merge queue tasks and return message', async function () {
            // given
            const getPullRequest = getPullRequestNock({ repository: 'pix', prNumber: 123, sha: 'my-sha' });

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

            // when
            const response = await server.inject({
              method: 'POST',
              url: '/github/webhook',
              headers: {
                ...createGithubWebhookSignatureHeader(JSON.stringify(body)),
                'x-github-event': 'check_suite',
              },
              payload: body,
            });

            // then
            expect(getPullRequest.isDone()).to.be.true;
            expect(response.statusCode).equal(200);
            expect(response.payload).equal('check_suite event handle');
          });
        });
      });
    });
  });
});

function getAppNock({ reviewAppName, returnCode = StatusCodes.OK }) {
  let body = undefined;
  if (returnCode === StatusCodes.OK) {
    body = { app: { name: reviewAppName } };
  }
  return nock('https://scalingo.reviewApps').get(`/v1/apps/${reviewAppName}`).reply(returnCode, body);
}

function createReviewAppNock({ appName, prNumber, returnCode = StatusCodes.CREATED }) {
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

function getPullRequestNock({ repository, prNumber, sha, state }) {
  return nock('https://api.github.com')
    .get(`/repos/1024pix/${repository}/pulls/${prNumber}`)
    .reply(200, { head: { sha, repo: { name: 'pix' }, ref: 'my-branch' }, labels: [], state });
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

function deployReviewAppNock({ reviewAppName, branch = 'my-branch', returnCode = StatusCodes.OK }) {
  return nock('https://scalingo.reviewApps')
    .post(`/v1/apps/${reviewAppName}/scm_repo_link/manual_deploy`, { branch: branch })
    .reply(returnCode);
}

function disableAutoDeployNock({ reviewAppName, returnCode = StatusCodes.CREATED }) {
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

function createPullRequestCommentNock({ repository, prNumber }) {
  return nock('https://api.github.com')
    .post(`/repos/github-owner/${repository}/issues/${prNumber}/comments`)
    .reply(StatusCodes.OK, { user: { login: 'pix-bot-github' }, id: 1 });
}

function getPullRequestCommentNock({ repository, prNumber }) {
  return nock('https://api.github.com')
    .get(`/repos/github-owner/${repository}/issues/${prNumber}/comments`)
    .reply(StatusCodes.OK, [{ user: { login: 'pix-bot-github' }, id: 1 }]);
}

function editPullRequestCommentNock({ repository, commentId }) {
  return nock('https://api.github.com')
    .patch(`/repos/github-owner/${repository}/issues/comments/${commentId}`)
    .reply(StatusCodes.OK);
}
