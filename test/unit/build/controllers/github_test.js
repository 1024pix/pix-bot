const { expect, sinon } = require('../../../test-helper');
const githubController = require('../../../../build/controllers/github');
const githubService = require('../../../../common/services/github');

describe('#addApplicationLinkToPullRequest', function () {
  describe('when repositoryName is Pix', function () {
    it('should call gitHubService.commentPullRequest with application urls ', async function () {
      // given
      const data = { repositoryName: 'pix', pullRequestId: 0 };
      const commentStub = sinon.stub(githubService, 'commentPullRequest');

      // when
      await githubController.addApplicationLinkToPullRequest(data);

      // then
      const expectedComment =
        "I'm deploying this PR to these urls: \n" +
        ' - App (.fr): https://app-pr0.review.pix.fr\n' +
        '- App (.org): https://app-pr0.review.pix.org\n' +
        '- Orga: https://orga-pr0.review.pix.fr\n' +
        '- Certif: https://certif-pr0.review.pix.fr\n' +
        '- Admin:https://admin-pr0.review.pix.fr\n' +
        '- API: https://api-pr0.review.pix.fr/api/ \n' +
        'Please check it out!';

      expect(commentStub).to.have.been.calledOnceWithExactly({
        repositoryName: 'pix',
        pullRequestId: 0,
        comment: expectedComment,
      });
    });
  });
  describe('when repositoryName is not Pix', function () {
    it('should not call gitHubService.commentPullRequest', async function () {
      // given
      const data = { repositoryName: 'some-repository', pullRequestId: 0 };
      const commentStub = sinon.stub(githubService, 'commentPullRequest');

      // when
      await githubController.addApplicationLinkToPullRequest(data);

      // then
      expect(commentStub).to.not.have.been.called;
    });
  });
});
