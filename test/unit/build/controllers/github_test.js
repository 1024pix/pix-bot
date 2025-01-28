import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

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
      const template = 'Hello, url {{webApplicationUrl}}, {{pullRequestId}} and {{scalingoDashboardUrl}}';
      expect(githubController.getMessage('pix', '42', ['pix-review', 'pix-review2'], template)).to.equal(
        'Hello, url https://pix-pr42.review.pix.fr, 42 and https://dashboard.scalingo.com/apps/osc-fr1/pix-review-pr42/environment',
      );
    });

    it('replace multiple values', function () {
      const template = '{{pullRequestId}}, {{pullRequestId}}';
      expect(githubController.getMessage('pix', '43', ['pix-review'], template)).to.equal('43, 43');
    });
  });

  describe('#addMessageToPullRequest', function () {
    it('should call gitHubService.commentPullRequest', async function () {
      // given
      const data = { repositoryName: 'pix-bot', pullRequestId: 25, scalingoReviewApps: ['pix-bot-review'] };
      const githubService = {
        commentPullRequest: sinon.stub(),
      };

      // when
      await githubController.addMessageToPullRequest(data, { githubService });

      // then
      const comment = `Une fois l'application déployée, elle sera accessible à cette adresse https://bot-pr25.review.pix.fr
Les variables d'environnement seront accessibles sur scalingo https://dashboard.scalingo.com/apps/osc-fr1/pix-bot-review-pr25/environment
`;

      expect(githubService.commentPullRequest).to.have.been.calledOnceWithExactly({
        repositoryName: 'pix-bot',
        pullRequestId: 25,
        comment,
      });
    });
  });

  describe('#processWebhook', function () {
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
          it(`should call handleRA() method on ${action} action`, async function () {
            // given
            sinon.stub(request, 'payload').value({ action });

            const handleRA = sinon.stub();

            // when
            await githubController.processWebhook(request, { handleRA });

            // then
            expect(handleRA.calledOnceWithExactly(request)).to.be.true;
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
              const githubService = { checkUserBelongsToPix: sinon.stub() };
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
                const githubService = { checkUserBelongsToPix: sinon.stub() };
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
                const githubService = { checkUserBelongsToPix: sinon.stub() };
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

            // when
            await githubController.processWebhook(request, { handleCloseRA, mergeQueue });

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

            // when
            await githubController.processWebhook(request, { handleCloseRA, mergeQueue });

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

            // when
            await githubController.processWebhook(request, { mergeQueue });

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
            const githubService = { isPrLabelledWith: sinon.stub() };

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

  describe('#handleRA', function () {
    const request = {
      payload: {
        number: 3,
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
    };

    describe('when the Review App creation conditions are not met', function () {
      describe('when the project is a fork', function () {
        it('should not create a Review App', async function () {
          // given
          sinon.stub(request.payload.pull_request.head.repo, 'fork').value(true);

          // when
          const response = await githubController.handleRA(request);

          // then
          expect(response).to.equal('No RA for a fork');
        });
      });

      describe('when there is no RA configured for this repository', function () {
        it('should not create a Review App', async function () {
          // given
          sinon.stub(request.payload.pull_request.head.repo, 'name').value('no-ra-app-repo-name');

          // when
          const response = await githubController.handleRA(request);

          // then
          expect(response).to.equal('No RA configured for this repository');
        });
      });

      describe('when there is a no-review-app label on the PR', function () {
        it('should not create a Review App', async function () {
          // given
          request.payload.label = { name: 'no-review-app' };
          sinon.stub(request.payload.pull_request, 'labels').value([{ name: 'no-review-app' }]);

          // when
          const response = await githubController.handleRA(request);

          // then
          expect(response).to.equal('RA disabled for this PR');
        });
      });

      describe('when the PR is not opened', function () {
        it('should not create a Review App', async function () {
          // given
          sinon.stub(request.payload.pull_request, 'state').value('closed');
          // when
          const response = await githubController.handleRA(request);

          // then
          expect(response).to.equal('No RA for closed PR');
        });
      });
    });

    describe('when the Review App creation conditions are met', function () {
      it('should call scalingo to deploy the corresponding applications', async function () {
        // given
        const scalingoClientStub = sinon.stub();
        const deployUsingSCMStub = sinon.stub();
        const deployReviewAppStub = sinon.stub();
        const disableAutoDeployStub = sinon.stub();
        const reviewAppExistsStub = sinon.stub().resolves(false);
        const reviewAppRepositoryStub = {
          create: sinon.stub(),
        };
        scalingoClientStub.getInstance = sinon.stub().returns({
          deployUsingSCM: deployUsingSCMStub,
          deployReviewApp: deployReviewAppStub,
          disableAutoDeploy: disableAutoDeployStub,
          reviewAppExists: reviewAppExistsStub,
        });

        const addMessageToPullRequestStub = sinon.stub();
        const githubServiceStub = {
          addRADeploymentCheck: sinon.stub(),
        };

        // when
        await githubController.handleRA(
          request,
          scalingoClientStub,
          addMessageToPullRequestStub,
          githubServiceStub,
          reviewAppRepositoryStub,
        );

        // then

        expect(deployReviewAppStub.secondCall.calledWith('pix-audit-logger-review', 3)).to.be.true;
        expect(disableAutoDeployStub.secondCall.calledWith('pix-audit-logger-review-pr3')).to.be.true;
        expect(deployUsingSCMStub.secondCall.calledWith('pix-audit-logger-review-pr3', 'my-branch')).to.be.true;

        expect(deployReviewAppStub.thirdCall.calledWith('pix-front-review', 3)).to.be.true;
        expect(disableAutoDeployStub.thirdCall.calledWith('pix-front-review-pr3')).to.be.true;
        expect(deployUsingSCMStub.thirdCall.calledWith('pix-front-review-pr3', 'my-branch')).to.be.true;

        expect(addMessageToPullRequestStub).to.have.been.calledOnceWithExactly(
          {
            repositoryName: 'pix',
            scalingoReviewApps: ['pix-api-review', 'pix-audit-logger-review', 'pix-front-review'],
            pullRequestId: 3,
          },
          { githubService: githubServiceStub },
        );
        expect(githubServiceStub.addRADeploymentCheck).to.have.been.calledOnceWithExactly({
          repository: 'pix',
          prNumber: 3,
          status: 'pending',
        });
      });

      describe('when the review app does not exist', function () {
        it('should call scalingo to create and deploy the corresponding applications', async function () {
          // given
          const scalingoClientStub = sinon.stub();
          const deployUsingSCMStub = sinon.stub();
          const reviewAppExistsStub = sinon.stub().resolves(true);
          reviewAppExistsStub.withArgs('pix-api-review-pr3').resolves(false);
          const deployReviewAppStub = sinon.stub();
          const disableAutoDeployStub = sinon.stub();
          const addMessageToPullRequestStub = sinon.stub();
          const githubServiceStub = {
            addRADeploymentCheck: sinon.stub(),
          };
          const reviewAppRepositoryStub = {
            create: sinon.stub(),
          };

          scalingoClientStub.getInstance = sinon.stub().returns({
            deployUsingSCM: deployUsingSCMStub,
            reviewAppExists: reviewAppExistsStub,
            deployReviewApp: deployReviewAppStub,
            disableAutoDeploy: disableAutoDeployStub,
          });

          // when
          const response = await githubController.handleRA(
            request,
            scalingoClientStub,
            addMessageToPullRequestStub,
            githubServiceStub,
            reviewAppRepositoryStub,
          );

          // then
          expect(deployReviewAppStub.calledOnceWithExactly('pix-api-review', 3)).to.be.true;
          expect(disableAutoDeployStub.calledOnceWithExactly('pix-api-review-pr3')).to.be.true;
          expect(
            reviewAppRepositoryStub.create.calledWith({
              name: 'pix-api-review-pr3',
              repository: 'pix',
              prNumber: 3,
              parentApp: 'pix-api-review',
            }),
          ).to.be.true;
          expect(deployUsingSCMStub.firstCall.calledWith('pix-api-review-pr3', 'my-branch')).to.be.true;
          expect(deployUsingSCMStub.secondCall.calledWith('pix-audit-logger-review-pr3', 'my-branch')).to.be.true;
          expect(deployUsingSCMStub.thirdCall.calledWith('pix-front-review-pr3', 'my-branch')).to.be.true;

          expect(response).to.equal(
            'Triggered deployment of RA on app pix-api-review, pix-audit-logger-review, pix-front-review with pr 3',
          );
        });
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
        const response = await githubController.handleCloseRA(request, scalingoClientStub);

        expect(response).to.equal('unmanaged_repo is not managed by Pix Bot.');
      });
    });

    describe('when a Review App is already closed', function () {
      it('should inform that this Review App is already closed', async function () {
        // given
        const scalingoClientStub = sinon.stub();
        const reviewAppExistsStub = sinon.stub();
        const deleteReviewAppStub = sinon.stub();

        scalingoClientStub.getInstance = sinon.stub().returns({
          reviewAppExists: reviewAppExistsStub,
          deleteReviewApp: deleteReviewAppStub,
        });

        reviewAppExistsStub.withArgs('pix-api-review-pr3').resolves(true);
        reviewAppExistsStub.withArgs('pix-front-review-pr3').resolves(true);
        reviewAppExistsStub.withArgs('pix-audit-logger-review-pr3').resolves(false);

        // when
        const response = await githubController.handleCloseRA(request, scalingoClientStub);

        // then
        expect(response).to.equal(
          'Closed RA for PR 3 : pix-api-review-pr3, pix-audit-logger-review-pr3 (already closed), pix-front-review-pr3.',
        );
      });
    });

    describe('when a Review App exists', function () {
      it('should close this Review App', async function () {
        // given
        const scalingoClientStub = sinon.stub();
        const reviewAppExistsStub = sinon.stub();
        const deleteReviewAppStub = sinon.stub();

        scalingoClientStub.getInstance = sinon.stub().returns({
          reviewAppExists: reviewAppExistsStub,
          deleteReviewApp: deleteReviewAppStub,
        });

        reviewAppExistsStub.withArgs('pix-api-review-pr3').resolves(true);
        reviewAppExistsStub.withArgs('pix-front-review-pr3').resolves(true);
        reviewAppExistsStub.withArgs('pix-audit-logger-review-pr3').resolves(false);

        // when
        await githubController.handleCloseRA(request, scalingoClientStub);

        // then
        expect(deleteReviewAppStub.calledWith('pix-api-review-pr3')).to.be.true;
        expect(deleteReviewAppStub.calledWith('pix-audit-logger-review-pr3')).to.be.false;
        expect(deleteReviewAppStub.calledWith('pix-front-review-pr3')).to.be.true;
      });
    });
  });
});
