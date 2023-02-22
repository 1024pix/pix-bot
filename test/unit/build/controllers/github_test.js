const fs = require('fs');
const path = require('path');

const { expect, sinon } = require('../../../test-helper');
const githubController = require('../../../../build/controllers/github');

const githubService = require('../../../../common/services/github');

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
      'pix.md'
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
      'default.md'
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
      'Hello, url https://pix-pr42.review.pix.fr, 42 and https://dashboard.scalingo.com/apps/osc-fr1/pix-review-pr42/environment'
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
