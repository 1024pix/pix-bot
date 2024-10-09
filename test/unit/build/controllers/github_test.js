import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

import * as githubController from '../../../../build/controllers/github.js';
import { config } from '../../../../config.js';
import { catchErr, expect, sinon } from '../../../test-helper.js';

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
        ['opened', 'reopened'].forEach((action) => {
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

        it('should call handleRA() method on synchronize action', async function () {
          // given
          sinon.stub(request, 'payload').value({ action: 'synchronize' });

          const handleRA = sinon.stub();

          // when
          await githubController.processWebhook(request, { handleRA });

          // then
          expect(handleRA.calledOnceWithExactly(request)).to.be.true;
        });

        it('should call handleCloseRA() method on closed action', async function () {
          // given
          sinon.stub(request, 'payload').value({ action: 'closed' });

          const handleCloseRA = sinon.stub();

          // when
          await githubController.processWebhook(request, { handleCloseRA });

          // then
          expect(handleCloseRA.calledOnceWithExactly(request)).to.be.true;
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

        scalingoClientStub.getInstance = sinon.stub().returns({
          deployUsingSCM: deployUsingSCMStub,
          deployReviewApp: deployReviewAppStub,
          disableAutoDeploy: disableAutoDeployStub,
          reviewAppExists: reviewAppExistsStub,
        });

        const addMessageToPullRequestStub = sinon.stub();
        const githubServiceStub = sinon.stub();

        // when
        await githubController.handleRA(request, scalingoClientStub, addMessageToPullRequestStub, githubServiceStub);

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
      });

      it('throws an error on scalingo deployment fails', async function () {
        // given
        const scalingoClientStub = sinon.stub();
        const deployUsingSCMStub = sinon.stub().rejects(new Error('Deployment error'));
        const reviewAppExistsStub = sinon.stub().resolves(true);
        scalingoClientStub.getInstance = sinon.stub().returns({
          deployUsingSCM: deployUsingSCMStub,
          reviewAppExists: reviewAppExistsStub,
        });

        // when
        const result = await catchErr(githubController.handleRA)(request, scalingoClientStub);

        // then
        expect(result).to.be.instanceOf(Error);
        expect(result.message).to.equal('No RA deployed for repository pix and pr3');
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
          const githubServiceStub = sinon.stub();

          scalingoClientStub.getInstance = sinon.stub().returns({
            deployUsingSCM: deployUsingSCMStub,
            reviewAppExists: reviewAppExistsStub,
            deployReviewApp: deployReviewAppStub,
            disableAutoDeploy: disableAutoDeployStub,
          });

          // when
          const response = await githubController.handleRA(request, scalingoClientStub, githubServiceStub);

          // then
          expect(deployReviewAppStub.calledOnceWithExactly('pix-api-review', 3)).to.be.true;
          expect(disableAutoDeployStub.calledOnceWithExactly('pix-api-review-pr3')).to.be.true;
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
    const request = {
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
