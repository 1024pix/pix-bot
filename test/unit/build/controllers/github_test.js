import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

const COMMENT = `Choisir les applications à déployer :

- [ ] [API](https://api-pr123.review.pix.fr/api/) | [👩‍💻 Dashboard Scalingo](https://dashboard.scalingo.com/apps/osc-fr1/pix-api-review-pr123/environment) <!-- pix-api-review -->
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

import * as githubController from '../../../../build/controllers/github.js';
import { config } from '../../../../config.js';
import { catchErr, expect, sinon } from '../../../test-helper.js';
import { MERGE_STATUS } from '../../../../build/services/merge-queue.js';

describe('Unit | Controller | Github', function () {
  describe('#getMessageTemplate', function () {
    let __dirname;

    before(function () {
      __dirname = url.fileURLToPath(new URL('.', import.meta.url));
    });

    it('get a specific message per repository', function () {
      const filePath = path.join(
        __dirname,
        '..',
        '..',
        '..',
        '..',
        'build',
        'templates',
        'pull-request-messages',
        'pix.md',
      );
      const template = githubController.getMessageTemplate('pix');
      const comment = fs.readFileSync(filePath, 'utf8');
      expect(template).to.equal(comment);
    });

    it('when the repository has no specific template', function () {
      const filePath = path.join(
        __dirname,
        '..',
        '..',
        '..',
        '..',
        'build',
        'templates',
        'pull-request-messages',
        'default.md',
      );
      const template = githubController.getMessageTemplate('no-repository-named-like-that');
      const comment = fs.readFileSync(filePath, 'utf8');
      expect(template).to.equal(comment);
    });
  });

  describe('#getMessage', function () {
    it('replace template placeholders with params', function () {
      const template = 'Choisir les applications à déployer :\n{{checkboxesForReviewAppsToBeDeployed}}';
      expect(githubController.getMessage('42', [{ appName: 'pix-review' }, { appName: 'pix-review2' }], template)).to
        .equal(`Choisir les applications à déployer :
- [ ] [pix](https://pix-review-pr42.osc-fr1.scalingo.io/) | [👩‍💻 Dashboard Scalingo](https://dashboard.scalingo.com/apps/osc-fr1/pix-review-pr42/environment) <!-- pix-review -->
- [ ] [pix2](https://pix-review2-pr42.osc-fr1.scalingo.io/) | [👩‍💻 Dashboard Scalingo](https://dashboard.scalingo.com/apps/osc-fr1/pix-review2-pr42/environment) <!-- pix-review2 -->`);
    });

    it('replace multiple values', function () {
      const template = '{{pullRequestId}}, {{pullRequestId}}';
      expect(githubController.getMessage('43', [{ appName: 'pix-review' }], template)).to.equal('43, 43');
    });
  });

  describe('#processWebhook', function () {
    describe('when pix-bot env is not defined', function () {
      describe('when pull-request has a pix-bot env label', function () {
        it('should ignore the event', async function () {
          // given
          const request = {
            headers: {
              'x-github-event': 'pull_request',
            },
            payload: {
              pull_request: {
                labels: [{ name: 'pix-bot-dummy' }],
              },
            },
          };

          // when
          const result = await githubController.processWebhook(request);

          // then
          expect(result).to.equal('Ignoring because pull request is labelled with a pix-bot-xxx label');
        });
      });

      describe('when pull-request has no pix-bot env label', function () {
        it('should handle the event', async function () {
          // given
          const request = {
            headers: {
              'x-github-event': 'pull_request',
            },
            payload: {
              action: 'nothing',
              pull_request: {
                labels: [],
              },
            },
          };

          // when
          const result = await githubController.processWebhook(request);

          // then
          expect(result).to.equal('Ignoring nothing action');
        });
      });
    });

    describe('when pix-bot env is defined', function () {
      describe('when pull-request does not have the corresponding pix-bot env label', function () {
        it('should ignore the event', async function () {
          // given
          const request = {
            headers: {
              'x-github-event': 'pull_request',
            },
            payload: {
              pull_request: {
                labels: [{ name: 'pix-bot-review' }],
              },
            },
          };
          sinon.stub(config.github, 'pixBotEnvLabel').value('pix-bot-integration');

          // when
          const result = await githubController.processWebhook(request);

          // then
          expect(result).to.equal(`Ignoring because pull request should have the pix-bot-integration label`);
        });
      });

      describe('when pull-request has the corresponding pix-bot env label', function () {
        it('should handle the event', async function () {
          // given
          const request = {
            headers: {
              'x-github-event': 'pull_request',
            },
            payload: {
              action: 'nothing',
              pull_request: {
                labels: [{ name: 'pix-bot-integration' }],
              },
            },
          };
          sinon.stub(config.github, 'pixBotEnvLabel').value('pix-bot-integration');

          // when
          const result = await githubController.processWebhook(request);

          // then
          expect(result).to.equal('Ignoring nothing action');
        });
      });
    });

    describe('when event is not handled', function () {
      it('should ignore the event', async function () {
        // given
        const request = {
          headers: {
            'x-github-event': 'unhandled-event',
          },
        };

        // when
        const result = await githubController.processWebhook(request);

        // then
        expect(result).to.equal('Ignoring unhandled-event event');
      });
    });

    describe('when event is handled', function () {
      describe('when event is push', function () {
        it('should call pushOnDefaultBranchWebhook() method', async function () {
          // given
          const request = {
            headers: {
              'x-github-event': 'push',
            },
          };

          const pushOnDefaultBranchWebhook = sinon.stub();

          // when
          await githubController.processWebhook(request, { pushOnDefaultBranchWebhook });

          // then
          expect(pushOnDefaultBranchWebhook.calledOnceWithExactly(request)).to.be.true;
        });
      });

      describe('when event is pull_request', function () {
        const request = {
          headers: {
            'x-github-event': 'pull_request',
          },
          payload: { action: 'nothing' },
        };

        ['opened', 'reopened', 'synchronize'].forEach((action) => {
          it(`should call handlePullRequest() method on ${action} action`, async function () {
            // given
            sinon.stub(request, 'payload').value({ action });

            const handlePullRequest = sinon.stub();

            // when
            await githubController.processWebhook(request, { handlePullRequest });

            // then
            expect(handlePullRequest.calledOnceWithExactly(request)).to.be.true;
          });
        });

        describe('when action is `labeled`', function () {
          describe('when user is not allowed to trigger an action from a label', function () {
            it('should do nothing', async function () {
              sinon.stub(config.github, 'automerge').value({
                allowedRepositories: ['1024pix/pix-sample-repo'],
              });
              sinon.stub(request, 'payload').value({
                action: 'labeled',
                number: 123,
                label: { name: ':rocket: Ready to Merge' },
                repository: { full_name: '1024pix/pix-sample-repo' },
                sender: {
                  login: 'bob',
                },
              });
              const mergeQueue = sinon.stub();
              const githubService = { checkUserBelongsToPix: sinon.stub(), getPullRequestForEvent: sinon.stub() };
              githubService.checkUserBelongsToPix.resolves(false);
              const pullRequestRepository = { save: sinon.stub() };

              // when
              await githubController.processWebhook(request, { mergeQueue, pullRequestRepository, githubService });

              // then
              expect(pullRequestRepository.save).to.have.not.been.called;
              expect(mergeQueue).to.have.not.be.called;
            });
          });

          describe('when label is Ready-to-merge', function () {
            describe('when repo is allowed', function () {
              it('should call pullRequestRepository.save() method', async function () {
                // given
                const repositoryName = '1024pix/pix-sample-repo';
                sinon.stub(config.github, 'automerge').value({
                  allowedRepositories: [repositoryName],
                });
                sinon.stub(request, 'payload').value({
                  action: 'labeled',
                  number: 123,
                  label: { name: ':rocket: Ready to Merge' },
                  repository: { full_name: repositoryName },
                  sender: {
                    login: 'ouiiiii',
                  },
                });

                const mergeQueue = { managePullRequest: sinon.stub() };
                const githubService = { checkUserBelongsToPix: sinon.stub(), getPullRequestForEvent: sinon.stub() };
                githubService.checkUserBelongsToPix.resolves(true);

                // when
                await githubController.processWebhook(request, { githubService, mergeQueue });

                // then
                expect(mergeQueue.managePullRequest).to.be.calledOnceWithExactly({
                  number: 123,
                  repositoryName,
                });
              });
            });

            describe('when repo is not allowed', function () {
              it('should do nothing', async function () {
                // given
                sinon.stub(config.github, 'automerge').value({
                  allowedRepositories: ['1024pix/another-repo'],
                });
                sinon.stub(request, 'payload').value({
                  action: 'labeled',
                  number: 123,
                  label: { name: ':rocket: Ready to Merge' },
                  repository: { full_name: '1024pix/pix-sample-repo' },
                  sender: {
                    login: 'Yolo',
                  },
                });

                const mergeQueue = sinon.stub();
                const pullRequestRepository = { save: sinon.stub() };
                const githubService = { checkUserBelongsToPix: sinon.stub(), getPullRequestForEvent: sinon.stub() };
                githubService.checkUserBelongsToPix.resolves(true);
                // when
                await githubController.processWebhook(request, { githubService, pullRequestRepository, mergeQueue });

                // then
                expect(pullRequestRepository.save).to.have.not.been.called;
                expect(mergeQueue).to.have.not.be.called;
              });
            });
          });
        });

        describe('when action is `unlabeled`', function () {
          describe('when label is Ready-to-merge', function () {
            it('should call pullRequestRepository.remove() method', async function () {
              // given
              const repositoryName = '1024pix/pix-sample-repo';
              sinon.stub(request, 'payload').value({
                action: 'unlabeled',
                number: 123,
                label: { name: ':rocket: Ready to Merge' },
                repository: { full_name: repositoryName },
              });

              const mergeQueue = { unmanagePullRequest: sinon.stub() };

              // when
              await githubController.processWebhook(request, { mergeQueue });

              // then
              expect(mergeQueue.unmanagePullRequest).to.be.calledOnceWithExactly({
                number: 123,
                repositoryName: repositoryName,
                status: MERGE_STATUS.ABORTED,
              });
            });
          });
        });

        describe('when action is `closed` and pr is not merged', function () {
          it('should call pullRequestRepository.remove() method', async function () {
            // given
            const repositoryName = '1024pix/pix-sample-repo';
            sinon.stub(request, 'payload').value({
              action: 'closed',
              number: 123,
              repository: { full_name: repositoryName },
              pull_request: {
                merged: false,
              },
            });

            const handleCloseRA = sinon.stub();
            const mergeQueue = { unmanagePullRequest: sinon.stub() };
            const githubService = { getPullRequestForEvent: sinon.stub() };

            // when
            await githubController.processWebhook(request, { githubService, handleCloseRA, mergeQueue });

            // then
            expect(mergeQueue.unmanagePullRequest).to.be.calledOnceWithExactly({
              number: 123,
              repositoryName,
              status: MERGE_STATUS.ABORTED,
            });
            expect(handleCloseRA.calledOnceWithExactly(request)).to.be.true;
          });
        });

        describe('when action is `closed` and pr is merged', function () {
          it('should call pullRequestRepository.remove() method', async function () {
            // given
            const repositoryName = '1024pix/pix-sample-repo';
            sinon.stub(request, 'payload').value({
              action: 'closed',
              number: 123,
              repository: { full_name: repositoryName },
              pull_request: {
                merged: true,
              },
            });

            const handleCloseRA = sinon.stub();
            const mergeQueue = { unmanagePullRequest: sinon.stub() };
            const githubService = { getPullRequestForEvent: sinon.stub() };

            // when
            await githubController.processWebhook(request, { githubService, handleCloseRA, mergeQueue });

            // then
            expect(mergeQueue.unmanagePullRequest).to.be.calledOnceWithExactly({
              number: 123,
              repositoryName,
              status: MERGE_STATUS.MERGED,
            });
            expect(handleCloseRA.calledOnceWithExactly(request)).to.be.true;
          });
        });

        it('should ignore the action', async function () {
          // given
          sinon.stub(request, 'payload').value({ action: 'unhandled-action' });

          // when
          const result = await githubController.processWebhook(request);

          // then
          expect(result).to.equal('Ignoring unhandled-action action');
        });
      });

      describe('when event is check_suite', function () {
        describe("when action is 'completed' and conclusion is not 'success'", function () {
          it('should call pullRequestRepository.update() method', async function () {
            const repositoryName = '1024pix/pix-sample-repo';
            const request = {
              headers: {
                'x-github-event': 'check_suite',
              },
              payload: {
                action: 'completed',
                repository: { full_name: repositoryName },
                check_suite: { conclusion: 'failure', pull_requests: [{ number: 123 }] },
              },
            };

            const mergeQueue = { unmanagePullRequest: sinon.stub() };
            const githubService = { getPullRequestForEvent: sinon.stub() };

            // when
            await githubController.processWebhook(request, { githubService, mergeQueue });

            // then
            expect(mergeQueue.unmanagePullRequest).to.be.calledOnceWithExactly({
              number: 123,
              repositoryName,
              status: MERGE_STATUS.ABORTED,
            });
          });
        });

        describe("when action is 'completed' and conclusion is 'success'", function () {
          it('should return ignoring message when not pr are related to check_suite', async function () {
            const request = {
              headers: {
                'x-github-event': 'check_suite',
              },
              payload: {
                action: 'completed',
                repository: { full_name: '1024pix/pix-test' },
                check_suite: { conclusion: 'success', pull_requests: [] },
              },
            };

            const result = await githubController.processWebhook(request, {});

            expect(result).to.equal('check_suite is not related to any pull_request');
          });

          it('should check PR as Ready to Merge label before saved it', async function () {
            const repositoryName = '1024pix/pix-sample-repo';
            const prNumber = 123;
            const request = {
              headers: {
                'x-github-event': 'check_suite',
              },
              payload: {
                action: 'completed',
                repository: { full_name: repositoryName },
                check_suite: { conclusion: 'success', pull_requests: [{ number: prNumber }] },
              },
            };

            const mergeQueue = { managePullRequest: sinon.stub() };
            const githubService = { isPrLabelledWith: sinon.stub(), getPullRequestForEvent: sinon.stub() };

            githubService.isPrLabelledWith
              .resolves(false)
              .withArgs({
                repositoryName,
                number: prNumber,
                label: ':rocket: Ready to Merge',
              })
              .resolves(true);
            // when
            await githubController.processWebhook(request, { githubService, mergeQueue });

            // then
            expect(mergeQueue.managePullRequest).to.be.calledOnceWithExactly({
              number: prNumber,
              repositoryName,
            });
          });
        });
      });

      describe('when event is issue_comment', function () {
        describe('when action is edited', function () {
          it('should handle issue comment', async function () {
            // given
            const pullRequest = { labels: [] };
            const githubService = { getPullRequestForEvent: sinon.stub().resolves(pullRequest) };
            const request = {
              headers: {
                'x-github-event': 'issue_comment',
              },
              payload: { action: 'edited', comment: { body: 'je suis un commentaire modifié' } },
            };
            const handleIssueComment = sinon.stub().resolves('Handle issue comment');

            // when
            const result = await githubController.processWebhook(request, { githubService, handleIssueComment });

            // then
            expect(result).to.equal('Handle issue comment');
            expect(handleIssueComment).to.have.been.calledWithExactly({ request, pullRequest });
          });
        });

        describe('when action is not edited', function () {
          it('should do nothing', async function () {
            // given
            const githubService = { getPullRequestForEvent: sinon.stub() };
            const request = {
              headers: {
                'x-github-event': 'issue_comment',
              },
              payload: { action: 'deleted' },
            };

            // when
            const result = await githubController.processWebhook(request, { githubService });

            // then
            expect(result).to.equal('Ignoring issue comment deleted');
          });
        });
      });
    });
  });

  describe('#pushOnDefaultBranchWebhook', function () {
    const default_branch = 'default_branch_name';
    const request = {
      payload: {
        ref: `refs/heads/${default_branch}`,
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
      },
    };

    describe('when push is not on the default branch', function () {
      it('should ignore the push', async function () {
        // given
        sinon.stub(request.payload, 'ref').value('ref/heads/non_default_branch');

        // when
        const result = await githubController.pushOnDefaultBranchWebhook(request);

        // then
        expect(result).to.equal('Ignoring push event on branch non_default_branch as it is not the default branch');
      });
    });

    describe('when push is not on a configured repository', function () {
      it('should ignore the push', async function () {
        // given
        sinon.stub(request.payload.repository, 'name').value('unhandled_repo');

        // when
        const result = await githubController.pushOnDefaultBranchWebhook(request);

        // then
        expect(result).to.equal('Ignoring push event on repository unhandled_repo as it is not configured');
      });
    });

    describe('when deploying main branch on configured repository', function () {
      it('calls scalingo to deploy the corresponding applications', async function () {
        // given
        const scalingoClientStub = sinon.stub();
        const deployFromArchiveStub = sinon.stub();
        scalingoClientStub.getInstance = sinon.stub().returns({
          deployFromArchive: deployFromArchiveStub,
        });

        sinon.stub(config.scalingo, 'repositoryToScalingoIntegration').value({
          'pix-repo': ['pix-front1-integration', 'pix-front2-integration', 'pix-api-integration'],
        });

        // when
        const result = await githubController.pushOnDefaultBranchWebhook(request, scalingoClientStub);

        // then
        expect(result).to.equal(
          'Deploying branch default_branch_name on integration applications : pix-front1-integration, pix-front2-integration, pix-api-integration',
        );
        expect(
          deployFromArchiveStub.firstCall.calledWith('pix-front1-integration', 'default_branch_name', 'pix-repo', {
            withEnvSuffix: false,
          }),
        ).to.be.true;
        expect(
          deployFromArchiveStub.secondCall.calledWith('pix-front2-integration', 'default_branch_name', 'pix-repo', {
            withEnvSuffix: false,
          }),
        ).to.be.true;
        expect(
          deployFromArchiveStub.thirdCall.calledWith('pix-api-integration', 'default_branch_name', 'pix-repo', {
            withEnvSuffix: false,
          }),
        ).to.be.true;
      });

      it('throws an error on scalingo deployment fails', async function () {
        // given
        const scalingoClientStub = sinon.stub();
        const deployFromArchiveStub = sinon.stub().rejects(new Error('Deployment error'));
        scalingoClientStub.getInstance = sinon.stub().returns({
          deployFromArchive: deployFromArchiveStub,
        });

        sinon.stub(config.scalingo, 'repositoryToScalingoIntegration').value({
          'pix-repo': ['pix-front1-integration', 'pix-front2-integration', 'pix-api-integration'],
        });

        // when
        const result = await catchErr(githubController.pushOnDefaultBranchWebhook)(request, scalingoClientStub);

        // then
        expect(result).to.be.instanceOf(Error);
        expect(result.message).to.equal(
          'Error during Scalingo deployment of application pix-front1-integration : Deployment error',
        );
      });
    });
  });

  describe('#handleCloseRA', function () {
    let request;

    beforeEach(function () {
      request = {
        payload: {
          number: 3,
          pull_request: {
            state: 'closed',
            labels: [],
            head: {
              ref: 'my-branch',
              repo: {
                name: 'pix',
                fork: false,
              },
              sha: 'abc123',
            },
          },
        },
      };
    });

    describe('when the review app is not managed by Pix Bot', function () {
      it('should not try to close the review app', async function () {
        // given
        const scalingoClientStub = sinon.stub();
        const reviewAppExistsStub = sinon.stub();
        const deleteReviewAppStub = sinon.stub();
        scalingoClientStub.getInstance = sinon.stub().returns({
          reviewAppExists: reviewAppExistsStub,
          deleteReviewApp: deleteReviewAppStub,
        });

        request.payload.pull_request.head.repo.name = 'unmanaged_repo';

        // when
        const response = await githubController.handleCloseRA(request, {
          scalingoClient: scalingoClientStub,
        });

        expect(response).to.equal('unmanaged_repo is not managed by Pix Bot.');
      });
    });

    describe('when a Review App is already closed', function () {
      it('should inform that this Review App is already closed', async function () {
        // given
        const scalingoClientStub = sinon.stub();
        const reviewAppExistsStub = sinon.stub();
        const deleteReviewAppStub = sinon.stub();
        const reviewAppRepositoryStub = {
          remove: sinon.stub(),
        };
        scalingoClientStub.getInstance = sinon.stub().returns({
          reviewAppExists: reviewAppExistsStub,
          deleteReviewApp: deleteReviewAppStub,
        });
        const updateCheckRADeployment = sinon.stub().resolves();

        reviewAppExistsStub.withArgs('pix-api-review-pr3').resolves(true);
        reviewAppExistsStub.withArgs('pix-admin-review-pr3').resolves(true);
        reviewAppExistsStub.withArgs('pix-audit-logger-review-pr3').resolves(false);

        // when
        const response = await githubController.handleCloseRA(request, {
          scalingoClient: scalingoClientStub,
          reviewAppRepo: reviewAppRepositoryStub,
          updateCheckRADeployment,
        });

        // then
        expect(response).to.equal(
          'Closed RA for PR 3 : pix-api-review-pr3, pix-app-review-pr3 (already closed), pix-orga-review-pr3 (already closed), pix-certif-review-pr3 (already closed), pix-junior-review-pr3 (already closed), pix-admin-review-pr3, pix-api-maddo-review-pr3 (already closed), pix-audit-logger-review-pr3 (already closed).',
        );
        expect(updateCheckRADeployment).to.have.been.calledWith({
          repositoryName: 'pix',
          pullRequestNumber: 3,
          sha: 'abc123',
        });
      });

      it('should remove the review app in database anyway', async function () {
        // given
        const scalingoClientStub = sinon.stub();
        const reviewAppExistsStub = sinon.stub();
        const deleteReviewAppStub = sinon.stub();
        const reviewAppRepositoryStub = {
          remove: sinon.stub(),
        };
        scalingoClientStub.getInstance = sinon.stub().returns({
          reviewAppExists: reviewAppExistsStub,
          deleteReviewApp: deleteReviewAppStub,
        });
        const updateCheckRADeployment = sinon.stub().resolves();

        reviewAppExistsStub.withArgs('pix-api-review-pr3').resolves(true);
        reviewAppExistsStub.withArgs('pix-admin-review-pr3').resolves(true);
        reviewAppExistsStub.withArgs('pix-audit-logger-review-pr3').resolves(false);

        // when
        await githubController.handleCloseRA(request, {
          scalingoClient: scalingoClientStub,
          reviewAppRepo: reviewAppRepositoryStub,
          updateCheckRADeployment,
        });

        // then
        expect(reviewAppRepositoryStub.remove.calledWith({ name: 'pix-api-review-pr3' })).to.be.true;
        expect(reviewAppRepositoryStub.remove.calledWith({ name: 'pix-admin-review-pr3' })).to.be.true;
        expect(reviewAppRepositoryStub.remove.calledWith({ name: 'pix-audit-logger-review-pr3' })).to.be.true;
        expect(updateCheckRADeployment).to.have.been.calledWith({
          repositoryName: 'pix',
          pullRequestNumber: 3,
          sha: 'abc123',
        });
      });
    });

    describe('when a Review App exists', function () {
      it('should close this Review App and remove the entry in DB', async function () {
        // given
        const scalingoClientStub = sinon.stub();
        const reviewAppExistsStub = sinon.stub();
        const deleteReviewAppStub = sinon.stub();
        const reviewAppRepositoryStub = {
          remove: sinon.stub(),
        };

        scalingoClientStub.getInstance = sinon.stub().returns({
          reviewAppExists: reviewAppExistsStub,
          deleteReviewApp: deleteReviewAppStub,
        });
        const updateCheckRADeployment = sinon.stub().resolves();

        reviewAppExistsStub.withArgs('pix-api-review-pr3').resolves(true);
        reviewAppExistsStub.withArgs('pix-admin-review-pr3').resolves(true);
        reviewAppExistsStub.withArgs('pix-audit-logger-review-pr3').resolves(false);

        // when
        await githubController.handleCloseRA(request, {
          scalingoClient: scalingoClientStub,
          reviewAppRepo: reviewAppRepositoryStub,
          updateCheckRADeployment,
        });

        // then
        expect(reviewAppRepositoryStub.remove.calledWith({ name: 'pix-api-review-pr3' })).to.be.true;
        expect(deleteReviewAppStub.calledWith('pix-api-review-pr3')).to.be.true;
        expect(reviewAppRepositoryStub.remove.calledWith({ name: 'pix-audit-logger-review-pr3' })).to.be.true;
        expect(deleteReviewAppStub.calledWith('pix-audit-logger-review-pr3')).to.be.false;
        expect(reviewAppRepositoryStub.remove.calledWith({ name: 'pix-admin-review-pr3' })).to.be.true;
        expect(deleteReviewAppStub.calledWith('pix-admin-review-pr3')).to.be.true;
        expect(updateCheckRADeployment).to.have.been.calledWith({
          repositoryName: 'pix',
          pullRequestNumber: 3,
          sha: 'abc123',
        });
      });

      describe('when all the review apps are removed', function () {
        it('should set the check-ra-deployment check as succeeded', async function () {
          // given
          const scalingoClientStub = sinon.stub();
          const reviewAppExistsStub = sinon.stub();
          const deleteReviewAppStub = sinon.stub();
          const reviewAppRepositoryStub = {
            remove: sinon.stub(),
          };
          const updateCheckRADeployment = sinon.stub().resolves();

          scalingoClientStub.getInstance = sinon.stub().returns({
            reviewAppExists: reviewAppExistsStub,
            deleteReviewApp: deleteReviewAppStub,
          });

          reviewAppExistsStub.withArgs('pix-api-review-pr3').resolves(true);
          reviewAppExistsStub.withArgs('pix-admin-review-pr3').resolves(true);

          // when
          await githubController.handleCloseRA(request, {
            scalingoClient: scalingoClientStub,
            reviewAppRepo: reviewAppRepositoryStub,
            updateCheckRADeployment,
          });

          // then
          expect(updateCheckRADeployment).to.have.been.calledWith({
            repositoryName: 'pix',
            pullRequestNumber: 3,
            sha: 'abc123',
          });
        });
      });
    });
  });

  describe('#handlePullRequest', function () {
    describe('when conditions are not met', function () {
      describe('when the project is a fork', function () {
        it('should do nothing', async function () {
          // given
          const request = { payload: { pull_request: { head: { repo: { fork: true } } } } };

          // when
          const result = await githubController.handlePullRequest(request);

          // then
          expect(result).to.equal('No RA for a fork');
        });
      });

      describe('when there is no RA configured for this repository', function () {
        it('should do nothing', async function () {
          // given
          const request = { payload: { pull_request: { head: { repo: { name: 'no-ra-app-repo-name' } } } } };

          // when
          const result = await githubController.handlePullRequest(request);

          // then
          expect(result).to.equal('No RA configured for this repository');
        });
      });

      describe('when the PR is not opened', function () {
        it('should do nothing', async function () {
          // given
          const request = { payload: { pull_request: { state: 'closed', head: { repo: { name: 'pix' } } } } };

          // when
          const result = await githubController.handlePullRequest(request);

          // then
          expect(result).to.equal('No RA for closed PR');
        });
      });
    });

    describe('when conditions are met', function () {
      describe('when action is opened', function () {
        it('calls handlePullRequestOpened', async function () {
          // given
          const handlePullRequestOpened = sinon.stub().resolves('handlePullRequestOpened');
          const request = {
            payload: { action: 'opened', pull_request: { state: 'open', head: { repo: { name: 'pix' } } } },
          };

          // when
          const result = await githubController.handlePullRequest(request, { handlePullRequestOpened });

          // then
          expect(result).to.equal('handlePullRequestOpened');
          expect(handlePullRequestOpened).to.have.been.calledWithExactly(request);
        });
      });

      describe('when action is synchronize', function () {
        it('calls handlePullRequestSynchronize', async function () {
          // given
          const handlePullRequestSynchronize = sinon.stub().resolves('handleHeraSynchronize');
          const request = {
            payload: { action: 'synchronize', pull_request: { state: 'open', head: { repo: { name: 'pix' } } } },
          };

          // when
          const result = await githubController.handlePullRequest(request, { handlePullRequestSynchronize });

          // then
          expect(result).to.equal('handleHeraSynchronize');
          expect(handlePullRequestSynchronize).to.have.been.calledWithExactly(request);
        });
      });

      describe('when action is not handled', function () {
        it('does nothing and returns message', async function () {
          // given
          const request = {
            payload: { action: 'unhandled', pull_request: { state: 'open', head: { repo: { name: 'pix' } } } },
          };

          // when
          const result = await githubController.handlePullRequest(request);

          // then
          expect(result).to.equal('Action unhandled not handled');
        });
      });
    });
  });

  describe('#handlePullRequestOpened', function () {
    it('adds a message on the pull request', async function () {
      // given
      const request = {
        payload: {
          number: 123,
          pull_request: {
            head: {
              repo: {
                name: 'pix',
              },
              sha: 'abc123',
            },
          },
        },
      };
      const addMessageToPullRequest = sinon.stub().resolves();
      const githubService = {
        addRADeploymentCheck: sinon.stub().resolves(),
      };

      // when
      await githubController.handlePullRequestOpened(request, { addMessageToPullRequest, githubService });

      // then
      expect(addMessageToPullRequest).to.have.been.calledWithExactly({
        repositoryName: 'pix',
        reviewApps: githubController.repositoryToScalingoAppsReview.pix,
        pullRequestNumber: 123,
      });
      expect(githubService.addRADeploymentCheck).to.have.been.calledOnceWithExactly({
        repository: 'pix',
        prNumber: 123,
        status: 'success',
        sha: 'abc123',
      });
    });
  });

  describe('#addMessageToPullRequest', function () {
    it('calls github API to comment pull request', async function () {
      // given
      const repositoryName = 'pix';
      const pullRequestNumber = 123;
      const githubService = {
        commentPullRequest: sinon.stub().resolves(),
      };

      // when
      await githubController.addMessageToPullRequest(
        {
          repositoryName,
          pullRequestNumber,
          reviewApps: githubController.repositoryToScalingoAppsReview.pix,
        },
        { githubService },
      );

      // then
      expect(githubService.commentPullRequest).to.have.been.calledWithExactly({
        repositoryName,
        pullRequestId: pullRequestNumber,
        comment: COMMENT,
      });
    });
  });

  describe('#handleIssueComment', function () {
    describe('when comment doesn’t belong to Pix Bot', function () {
      it('should return appropriate message', async function () {
        const pullRequest = undefined;

        const request = {
          payload: {
            repository: {
              full_name: '@1024pix/pix',
            },
            issue: {
              pull_request: {},
              number: 123,
            },
            comment: {
              user: {
                login: 'pix-bot-dummy',
              },
            },
          },
        };

        const result = await githubController.handleIssueComment({ request, pullRequest });
        expect(result).equal('The conditions for editing an issue comment are not met.');
      });
    });

    describe('when review apps are not configured for repository', function () {
      it('should return message Repository is not managed by Pix Bot', async function () {
        const pullRequest = {
          head: {
            repo: {
              name: 'pix-toto',
              fork: false,
            },
          },
          state: 'open',
        };

        const request = {
          payload: {
            repository: {
              full_name: '@1024pix/pix',
            },
            issue: {
              pull_request: {},
              number: 123,
            },
            comment: {
              user: {
                login: 'pix-bot-github',
              },
            },
          },
        };

        const result = await githubController.handleIssueComment({ request, pullRequest });
        expect(result).equal(`Repository is not managed by Pix Bot.`);
      });
    });

    describe('when the comment is not authored by pix bot github', function () {
      it('should return appropriate message', async function () {
        const pullRequest = {
          head: {
            repo: {
              name: 'pix',
              fork: false,
            },
          },
          state: 'open',
        };

        const request = {
          payload: {
            repository: {
              full_name: '@1024pix/pix',
            },
            issue: {
              pull_request: {},
              number: 123,
            },
            comment: {
              user: {
                login: 'pix-hera',
              },
            },
          },
        };

        const result = await githubController.handleIssueComment({ request, pullRequest });
        expect(result).equal(`Ignoring pix-hera comment edition`);
      });
    });

    describe('when repository is from a fork', function () {
      it('should return appropriate message', async function () {
        const pullRequest = {
          head: {
            repo: {
              name: 'pix',
              fork: true,
            },
          },
          state: 'open',
        };

        const request = {
          payload: {
            repository: {
              full_name: '@1024pix/pix',
            },
            issue: {
              pull_request: {},
              number: 123,
            },
            comment: {
              user: {
                login: 'pix-bot-github',
              },
            },
          },
        };

        const result = await githubController.handleIssueComment({ request, pullRequest });
        expect(result).equal(`No RA for a fork`);
      });
    });

    describe('when the pull request is closed', function () {
      it('should return appropriate message', async function () {
        const pullRequest = {
          head: {
            repo: {
              name: 'pix',
              fork: false,
            },
          },
          state: 'closed',
        };

        const request = {
          payload: {
            repository: {
              full_name: '@1024pix/pix',
            },
            issue: {
              pull_request: {},
              number: 123,
            },
            comment: {
              user: {
                login: 'pix-bot-github',
              },
            },
          },
        };

        const result = await githubController.handleIssueComment({ request, pullRequest });
        expect(result).equal(`No RA for closed PR`);
      });
    });

    describe('when review apps are created or removed', function () {
      it('creates and removes review apps and returns a summary message', async function () {
        const reviewAppRepositoryStub = {
          listForPullRequest: sinon.stub().resolves([
            { name: 'pix-api-review-pr123', parentApp: 'pix-api-review' },
            { name: 'pix-api-maddo-review-pr123', parentApp: 'pix-api-maddo-review' },
          ]),
        };

        const updateCheckRADeployment = sinon.stub().resolves();
        const comment = `Choisir les applications à déployer :

- [X] App <!-- pix-app-review -->
- [X] API <!-- pix-api-review -->
- [ ] API MaDDo <!-- pix-api-maddo-review -->
- [ ] Audit Logger <!-- pix-audit-logger-review -->
`;
        const pullRequest = {
          head: {
            repo: {
              name: 'pix',
              fork: false,
            },
            ref: 'branche-a-deployer',
            sha: 'abc123',
          },
          state: 'open',
        };

        const request = {
          payload: {
            repository: {
              full_name: '@1024pix/pix',
            },
            issue: {
              pull_request: {},
              number: 123,
            },
            comment: {
              user: {
                login: 'pix-bot-github',
              },
              body: comment,
            },
          },
        };
        const createReviewApp = sinon.stub().resolves();
        const removeReviewApp = sinon.stub().resolves();

        const result = await githubController.handleIssueComment(
          { request, pullRequest },
          { reviewAppRepo: reviewAppRepositoryStub, createReviewApp, removeReviewApp, updateCheckRADeployment },
        );

        expect(createReviewApp).to.have.been.calledWithExactly({
          reviewAppName: 'pix-app-review-pr123',
          repositoryName: 'pix',
          pullRequestNumber: 123,
          ref: 'branche-a-deployer',
          parentApp: 'pix-app-review',
          shouldRemovePostgresAddon: true,
        });
        expect(removeReviewApp).to.have.been.calledWithExactly({
          reviewAppName: 'pix-api-maddo-review-pr123',
        });
        expect(updateCheckRADeployment).to.have.been.calledWithExactly({
          repositoryName: 'pix',
          pullRequestNumber: 123,
          sha: 'abc123',
        });
        expect(result).equal(`Created review apps: pix-app-review-pr123
Removed review apps: pix-api-maddo-review-pr123`);
      });
    });

    describe('when no review app is created nor removed', function () {
      it('should return "Nothing to do" message', async function () {
        const reviewAppRepositoryStub = {
          listForPullRequest: sinon.stub().resolves([
            { name: 'pix-api-review-pr123', parentApp: 'pix-api-review' },
            { name: 'pix-api-maddo-review-pr123', parentApp: 'pix-api-maddo-review' },
          ]),
        };
        const comment = `Choisir les applications à déployer :

- [] Admin <!-- pix-admin-review -->
- [X] API <!-- pix-api-review -->
- [X] API MaDDo <!-- pix-api-maddo-review -->
- [ ] Audit Logger <!-- pix-audit-logger-review -->
`;
        const pullRequest = {
          head: {
            repo: {
              name: 'pix',
              fork: false,
            },
          },
          state: 'open',
        };

        const request = {
          payload: {
            repository: {
              full_name: '@1024pix/pix',
            },
            issue: {
              pull_request: {},
              number: 123,
            },
            comment: {
              user: {
                login: 'pix-bot-github',
              },
              body: comment,
            },
          },
        };
        const result = await githubController.handleIssueComment(
          { request, pullRequest },
          { reviewAppRepo: reviewAppRepositoryStub },
        );
        expect(result).equal('Nothing to do');
      });
    });
  });

  describe('#createReviewApp', function () {
    describe('when review app does not exist on Scalingo', function () {
      it('creates and deploys review app', async function () {
        // given
        const parentApp = 'pix-api-review';
        const reviewAppName = 'pix-api-review-pr123';
        const repositoryName = 'pix';
        const pullRequestNumber = 123;
        const ref = 'la-branche';
        const shouldRemovePostgresAddon = false;

        const reviewAppRepo = {
          create: sinon.stub().resolves(),
        };
        const scalingoClientInstance = {
          reviewAppExists: sinon.stub().resolves(false),
          deployReviewApp: sinon.stub().resolves(),
          disableAutoDeploy: sinon.stub().resolves(),
          deployUsingSCM: sinon.stub().resolves(),
        };
        const scalingoClient = {
          getInstance: sinon.stub().resolves(scalingoClientInstance),
        };

        // when
        await githubController.createReviewApp(
          { pullRequestNumber, ref, repositoryName, reviewAppName, parentApp, shouldRemovePostgresAddon },
          { reviewAppRepo, scalingoClient },
        );

        // then
        expect(scalingoClientInstance.reviewAppExists).to.have.been.calledWithExactly(reviewAppName);
        expect(reviewAppRepo.create).to.have.been.calledWithExactly({
          name: reviewAppName,
          repository: repositoryName,
          prNumber: pullRequestNumber,
          parentApp,
        });
        expect(scalingoClientInstance.deployReviewApp).to.have.been.calledWithExactly(parentApp, pullRequestNumber);
        expect(scalingoClientInstance.disableAutoDeploy).to.have.been.calledWithExactly(reviewAppName);
        expect(scalingoClientInstance.deployUsingSCM).to.have.been.calledWithExactly(reviewAppName, ref);
      });

      describe('when postgres addon should be removed', function () {
        it('creates and deploys review app then removes postgres addon', async function () {
          // given
          const parentApp = 'pix-api-review';
          const reviewAppName = 'pix-api-review-pr123';
          const repositoryName = 'pix';
          const pullRequestNumber = 123;
          const ref = 'la-branche';
          const shouldRemovePostgresAddon = true;

          const reviewAppRepo = {
            create: sinon.stub().resolves(),
          };
          const scalingoClientInstance = {
            reviewAppExists: sinon.stub().resolves(false),
            deployReviewApp: sinon.stub().resolves(),
            disableAutoDeploy: sinon.stub().resolves(),
            deployUsingSCM: sinon.stub().resolves(),
            removeAddon: sinon.stub().resolves(),
          };
          const scalingoClient = {
            getInstance: sinon.stub().resolves(scalingoClientInstance),
          };

          // when
          await githubController.createReviewApp(
            { pullRequestNumber, ref, repositoryName, reviewAppName, parentApp, shouldRemovePostgresAddon },
            { reviewAppRepo, scalingoClient },
          );

          // then
          expect(scalingoClientInstance.reviewAppExists).to.have.been.calledWithExactly(reviewAppName);
          expect(reviewAppRepo.create).to.have.been.calledWithExactly({
            name: reviewAppName,
            repository: repositoryName,
            prNumber: pullRequestNumber,
            parentApp,
          });
          expect(scalingoClientInstance.deployReviewApp).to.have.been.calledWithExactly(parentApp, pullRequestNumber);
          expect(scalingoClientInstance.disableAutoDeploy).to.have.been.calledWithExactly(reviewAppName);
          expect(scalingoClientInstance.deployUsingSCM).to.have.been.calledWithExactly(reviewAppName, ref);
          expect(scalingoClientInstance.removeAddon).to.have.been.calledWithExactly(reviewAppName, 'postgresql');
        });
      });
    });

    describe('when review app already exists on Scalingo', function () {
      it('does nothing', async function () {
        // given
        const reviewAppName = 'pix-api-review-pr123';

        const scalingoClientInstance = {
          reviewAppExists: sinon.stub().resolves(true),
        };
        const scalingoClient = {
          getInstance: sinon.stub().resolves(scalingoClientInstance),
        };

        // when
        await githubController.createReviewApp({ reviewAppName }, { scalingoClient });

        // then
        expect(scalingoClientInstance.reviewAppExists).to.have.been.calledWithExactly(reviewAppName);
      });
    });
  });

  describe('#removeReviewApp', function () {
    describe('when review app exists on Scalingo', function () {
      it('removes review app', async function () {
        // given
        const reviewAppName = 'pix-api-review-pr123';

        const reviewAppRepo = {
          remove: sinon.stub().resolves(),
        };
        const scalingoClientInstance = {
          reviewAppExists: sinon.stub().resolves(true),
          deleteReviewApp: sinon.stub().resolves(),
        };
        const scalingoClient = {
          getInstance: sinon.stub().resolves(scalingoClientInstance),
        };

        // when
        await githubController.removeReviewApp({ reviewAppName }, { reviewAppRepo, scalingoClient });

        // then
        expect(scalingoClientInstance.reviewAppExists).to.have.been.calledWithExactly(reviewAppName);
        expect(reviewAppRepo.remove).to.have.been.calledWithExactly({ name: reviewAppName });
        expect(scalingoClientInstance.deleteReviewApp).to.have.been.calledWithExactly(reviewAppName);
      });
    });

    describe('when review app does not exist on Scalingo', function () {
      it('removes review app in database only', async function () {
        // given
        const reviewAppName = 'pix-api-review-pr123';

        const reviewAppRepo = {
          remove: sinon.stub().resolves(),
        };
        const scalingoClientInstance = {
          reviewAppExists: sinon.stub().resolves(false),
        };
        const scalingoClient = {
          getInstance: sinon.stub().resolves(scalingoClientInstance),
        };

        // when
        await githubController.removeReviewApp({ reviewAppName }, { scalingoClient, reviewAppRepo });

        // then
        expect(scalingoClientInstance.reviewAppExists).to.have.been.calledWithExactly(reviewAppName);
        expect(reviewAppRepo.remove).to.have.been.calledWithExactly({ name: reviewAppName });
      });
    });
  });

  describe('#handlePullRequestSynchronize', function () {
    it('triggers manual deployments for existing apps', async function () {
      // given
      const request = {
        payload: {
          number: 123,
          pull_request: {
            head: {
              ref: 'la-branche',
              repo: {
                name: 'pix',
              },
              sha: 'abc123',
            },
          },
        },
      };
      const reviewAppRepo = {
        listForPullRequest: sinon
          .stub()
          .resolves([{ name: 'pix-api-review-pr123' }, { name: 'pix-api-maddo-review-pr123' }]),
        setStatus: sinon.stub().resolves(),
      };
      const scalingoClientInstance = {
        deployUsingSCM: sinon.stub().resolves(),
      };
      const scalingoClient = {
        getInstance: sinon.stub().resolves(scalingoClientInstance),
      };
      const updateCheckRADeployment = sinon.stub().resolves();

      // when
      const result = await githubController.handlePullRequestSynchronize(request, {
        reviewAppRepo,
        scalingoClient,
        updateCheckRADeployment,
      });

      // then
      expect(result).to.equal('Deployed on PR 123 in repository pix');
      expect(reviewAppRepo.listForPullRequest).to.have.been.calledWithExactly({ repository: 'pix', prNumber: 123 });
      expect(scalingoClientInstance.deployUsingSCM).to.have.been.calledTwice;
      expect(scalingoClientInstance.deployUsingSCM).to.have.been.calledWithExactly(
        'pix-api-review-pr123',
        'la-branche',
      );
      expect(scalingoClientInstance.deployUsingSCM).to.have.been.calledWithExactly(
        'pix-api-maddo-review-pr123',
        'la-branche',
      );
      expect(reviewAppRepo.setStatus).to.have.been.calledTwice;
      expect(reviewAppRepo.setStatus).to.have.been.calledWithExactly({
        name: 'pix-api-review-pr123',
        status: 'pending',
      });
      expect(reviewAppRepo.setStatus).to.have.been.calledWithExactly({
        name: 'pix-api-maddo-review-pr123',
        status: 'pending',
      });
      expect(updateCheckRADeployment).to.have.been.calledOnceWithExactly({
        repositoryName: 'pix',
        pullRequestNumber: 123,
        sha: 'abc123',
      });
    });
  });

  describe('#handlePullRequestReopened', function () {
    it('edits the deployment message on the pull request', async function () {
      // given
      const request = {
        payload: {
          number: 123,
          pull_request: {
            head: {
              repo: {
                name: 'pix',
              },
              sha: 'abc123',
            },
          },
        },
      };
      const updateMessageToPullRequest = sinon.stub().resolves();
      const githubService = {
        addRADeploymentCheck: sinon.stub().resolves(),
      };

      // when
      await githubController.handlePullRequestReopened(request, { updateMessageToPullRequest, githubService });

      // then
      expect(updateMessageToPullRequest).to.have.been.calledWithExactly({
        repositoryName: 'pix',
        reviewApps: githubController.repositoryToScalingoAppsReview.pix,
        pullRequestNumber: 123,
      });
      expect(githubService.addRADeploymentCheck).to.have.been.calledOnceWithExactly({
        repository: 'pix',
        prNumber: 123,
        status: 'success',
        sha: 'abc123',
      });
    });
  });

  describe('#updateMessageToPullRequest', function () {
    it('calls github API to edit comment on pull request', async function () {
      // given
      const repositoryName = 'pix';
      const pullRequestNumber = 123;
      const githubService = {
        getPullRequestComments: sinon.stub().resolves([{ user: { login: 'pix-bot-github' }, id: 2 }]),
        editPullRequestComment: sinon.stub().resolves(),
      };

      // when
      await githubController.updateMessageToPullRequest(
        {
          repositoryName,
          pullRequestNumber,
          reviewApps: githubController.repositoryToScalingoAppsReview.pix,
        },
        { githubService },
      );

      // then
      expect(githubService.getPullRequestComments).to.have.been.calledWithExactly({
        repositoryName,
        pullRequestNumber,
      });
      expect(githubService.editPullRequestComment).to.have.been.calledWithExactly({
        repositoryName,
        commentId: 2,
        newComment: COMMENT,
      });
    });

    it('if deployedRAComment does not exist, we create a new comment', async function () {
      //given
      const repositoryName = 'pix';
      const pullRequestNumber = 123;
      const githubService = {
        getPullRequestComments: sinon.stub().resolves([]),
        commentPullRequest: sinon.stub(),
      };

      // when
      await githubController.updateMessageToPullRequest(
        {
          repositoryName,
          pullRequestNumber,
          reviewApps: githubController.repositoryToScalingoAppsReview.pix,
        },
        { githubService },
      );

      //then
      expect(githubService.commentPullRequest).to.have.been.calledWithExactly({
        repositoryName,
        pullRequestId: pullRequestNumber,
        comment: COMMENT,
      });
    });
  });
});
