const { expect, sinon } = require('../../../test-helper');
const githubController = require('../../../../build/controllers/github');
const githubService = require('../../../../common/services/github');

describe('#addApplicationLinkToPullRequest', function () {
  describe('when repositoryName is pix', function () {
    it('should call gitHubService.commentPullRequest with application urls', async function () {
      // given
      const data = { repositoryName: 'pix', pullRequestId: 0 };
      const commentStub = sinon.stub(githubService, 'commentPullRequest');

      // when
      await githubController.addApplicationLinkToPullRequest(data);

      // then
      const expectedComment =
        'Une fois les applications déployées, elles seront accessibles via les liens suivants :\n' +
        '* [App .fr](https://app-pr0.review.pix.fr)\n' +
        '* [App .org](https://app-pr0.review.pix.org)\n' +
        '* [Orga](https://orga-pr0.review.pix.fr)\n' +
        '* [Certif](https://certif-pr0.review.pix.fr)\n' +
        '* [Admin](https://admin-pr0.review.pix.fr)\n' +
        '* [API](https://api-pr0.review.pix.fr/api/)';

      expect(commentStub).to.have.been.calledOnceWithExactly({
        repositoryName: 'pix',
        pullRequestId: 0,
        comment: expectedComment,
      });
    });
  });
  describe('when repositoryName is pix-bot', function () {
    it('should call gitHubService.commentPullRequest with application urls', async function () {
      // given
      const data = { repositoryName: 'pix-bot', pullRequestId: 0 };
      const commentStub = sinon.stub(githubService, 'commentPullRequest');

      // when
      await githubController.addApplicationLinkToPullRequest(data);

      // then
      const expectedComment =
        'Une fois les applications déployées, elles seront accessibles via les liens suivants :\n' +
        'pix-bot-review.pr0.osc-fr1.scalingo.io.';
      expect(commentStub).to.have.been.calledOnceWithExactly({
        repositoryName: 'pix-bot',
        pullRequestId: 0,
        comment: expectedComment,
      });
    });
  });
  describe('when repositoryName is pix-site', function () {
    it('should call gitHubService.commentPullRequest with application urls', async function () {
      // given
      const data = { repositoryName: 'pix-site', pullRequestId: 0 };
      const commentStub = sinon.stub(githubService, 'commentPullRequest');

      // when
      await githubController.addApplicationLinkToPullRequest(data);

      // then
      const expectedComment =
        'Une fois les applications déployées, elles seront accessibles via les liens suivants :\n' +
        'Pix Site (fr): https://site-pr0.review.pix.fr/\n' +
        'Pix Site (org): https://site-pr0.review.pix.org/\n' +
        'Pix Pro (fr): https://pro-pr0.review.pix.fr/\n' +
        'Pix Pro (org): https://pro-pr0.review.pix.org/';

      expect(commentStub).to.have.been.calledOnceWithExactly({
        repositoryName: 'pix-site',
        pullRequestId: 0,
        comment: expectedComment,
      });
    });
  });
  describe('when repositoryName is pix-tutos', function () {
    it('should call gitHubService.commentPullRequest with application urls', async function () {
      // given
      const data = { repositoryName: 'pix-tutos', pullRequestId: 0 };
      const commentStub = sinon.stub(githubService, 'commentPullRequest');

      // when
      await githubController.addApplicationLinkToPullRequest(data);

      // then
      const expectedComment =
        'Une fois les applications déployées, elles seront accessibles via les liens suivants :\n' +
        'Pix Tutos : [tutos-pr0.review.pix.fr](https://tutos-pr0.review.pix.fr/)';

      expect(commentStub).to.have.been.calledOnceWithExactly({
        repositoryName: 'pix-tutos',
        pullRequestId: 0,
        comment: expectedComment,
      });
    });
  });
});
