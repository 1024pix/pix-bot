const { expect, sinon } = require('../../../test-helper');
const githubController = require('../../../../build/controllers/github');
const githubService = require('../../../../common/services/github');
const fs = require('fs');

describe('#addMessageToPullRequest', function () {
  describe('when the repository template is generic', function () {
    it('should call gitHubService.commentPullRequest with default template', async function () {
      // given
      const data = { repositoryName: 'pix-bot', pullRequestId: 25 };
      const commentStub = sinon.stub(githubService, 'commentPullRequest');

      // when
      await githubController.addMessageToPullRequest(data);

      // then
      const absoluteFileName = `${__dirname}/pull-request-messages/pix-bot.md`;
      const comment = fs.readFileSync(absoluteFileName, 'utf8');

      expect(commentStub).to.have.been.calledOnceWithExactly({
        repositoryName: 'pix-bot',
        pullRequestId: 25,
        comment,
      });
    });
  });
  describe('when the repository template is specific', function () {
    describe('should call gitHubService.commentPullRequest with specific template', function () {
      it('pix', async function () {
        // given
        const data = { repositoryName: 'pix', pullRequestId: 5401 };
        const commentStub = sinon.stub(githubService, 'commentPullRequest');

        // when
        await githubController.addMessageToPullRequest(data);

        // then
        const absoluteFileName = `${__dirname}/pull-request-messages/pix.md`;
        const comment = fs.readFileSync(absoluteFileName, 'utf8');

        expect(commentStub).to.have.been.calledOnceWithExactly({
          repositoryName: 'pix',
          pullRequestId: 5401,
          comment,
        });
      });
      it('pix-editor', async function () {
        // given
        const data = { repositoryName: 'pix-editor', pullRequestId: 49 };
        const commentStub = sinon.stub(githubService, 'commentPullRequest');

        // when
        await githubController.addMessageToPullRequest(data);

        // then
        const absoluteFileName = `${__dirname}/pull-request-messages/pix-editor.md`;
        const comment = fs.readFileSync(absoluteFileName, 'utf8');

        expect(commentStub).to.have.been.calledOnceWithExactly({
          repositoryName: 'pix-editor',
          pullRequestId: 49,
          comment,
        });
      });
      it('pix-db-replication', async function () {
        // given
        const data = { repositoryName: 'pix-db-replication', pullRequestId: 125 };
        const commentStub = sinon.stub(githubService, 'commentPullRequest');

        // when
        await githubController.addMessageToPullRequest(data);

        // then
        const absoluteFileName = `${__dirname}/pull-request-messages/pix-db-replication.md`;
        const comment = fs.readFileSync(absoluteFileName, 'utf8');

        expect(commentStub).to.have.been.calledOnceWithExactly({
          repositoryName: 'pix-db-replication',
          pullRequestId: 125,
          comment,
        });
      });
      it('pix-data', async function () {
        // given
        const data = { repositoryName: 'pix-data', pullRequestId: 115 };
        const commentStub = sinon.stub(githubService, 'commentPullRequest');

        // when
        await githubController.addMessageToPullRequest(data);

        // then
        const absoluteFileName = `${__dirname}/pull-request-messages/pix-data.md`;
        const comment = fs.readFileSync(absoluteFileName, 'utf8');

        expect(commentStub).to.have.been.calledOnceWithExactly({
          repositoryName: 'pix-data',
          pullRequestId: 115,
          comment,
        });
      });
    });
  });
});
