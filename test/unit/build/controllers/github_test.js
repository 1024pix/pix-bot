const fs = require('fs');
const path = require('path');

const { catchErr, expect, sinon } = require('../../../test-helper');
const githubController = require('../../../../build/controllers/github');

const githubService = require('../../../../common/services/github');
const config = require('../../../../config');

describe('#getMessageTemplate', function () {
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
    const commentStub = sinon.stub(githubService, 'commentPullRequest');

    // when
    await githubController.addMessageToPullRequest(data);

    // then
    const comment = `Une fois l'application déployée, elle sera accessible à cette adresse https://bot-pr25.review.pix.fr
Les variables d'environnement seront accessibles sur scalingo https://dashboard.scalingo.com/apps/osc-fr1/pix-bot-review-pr25/environment
`;

    expect(commentStub).to.have.been.calledOnceWithExactly({
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

        let injectedPushOnDefaultBranchWebhook = sinon.stub();

        // when
        await githubController.processWebhook(request, { injectedPushOnDefaultBranchWebhook });

        // then
        expect(injectedPushOnDefaultBranchWebhook.calledOnceWithExactly(request)).to.be.true;
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
        it(`should call pullRequestOpenedWebhook() method on ${action} action`, async function () {
          // given
          sinon.stub(request, 'payload').value({ action });

          let injectedPullRequestOpenedWebhook = sinon.stub();

          // when
          await githubController.processWebhook(request, { injectedPullRequestOpenedWebhook });

          // then
          expect(injectedPullRequestOpenedWebhook.calledOnceWithExactly(request)).to.be.true;
        });
      });

      it('should call pullRequestSynchronizeWebhook() method on synchronize action', async function () {
        // given
        sinon.stub(request, 'payload').value({ action: 'synchronize' });

        let injectedPullRequestSynchronizeWebhook = sinon.stub();

        // when
        await githubController.processWebhook(request, { injectedPullRequestSynchronizeWebhook });

        // then
        expect(injectedPullRequestSynchronizeWebhook.calledOnceWithExactly(request)).to.be.true;
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
      const injectedScalingoClientStub = sinon.stub();
      const deployFromArchiveStub = sinon.stub();
      injectedScalingoClientStub.getInstance = sinon.stub().returns({
        deployFromArchive: deployFromArchiveStub,
      });

      sinon.stub(config.scalingo, 'repositoryToScalingoIntegration').value({
        'pix-repo': ['pix-front1-integration', 'pix-front2-integration', 'pix-api-integration'],
      });

      // when
      const result = await githubController.pushOnDefaultBranchWebhook(request, injectedScalingoClientStub);

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
      const injectedScalingoClientStub = sinon.stub();
      const deployFromArchiveStub = sinon.stub().rejects(new Error('Deployment error'));
      injectedScalingoClientStub.getInstance = sinon.stub().returns({
        deployFromArchive: deployFromArchiveStub,
      });

      sinon.stub(config.scalingo, 'repositoryToScalingoIntegration').value({
        'pix-repo': ['pix-front1-integration', 'pix-front2-integration', 'pix-api-integration'],
      });

      // when
      const result = await catchErr(githubController.pushOnDefaultBranchWebhook)(request, injectedScalingoClientStub);

      // then
      expect(result).to.be.instanceOf(Error);
      expect(result.message).to.equal(
        'Error during Scalingo deployment of application pix-front1-integration : Deployment error',
      );
    });
  });
});
