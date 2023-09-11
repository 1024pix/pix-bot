const { expect, sinon } = require('../../../test-helper');

const { getPullRequestsFromCommitsShas } = require('../../../../common/services/github');

describe('Unit | Common | Services | Github', function () {
  describe('getPullRequestsFromCommitsShas', function () {
    afterEach(function () {
      sinon.restore();
    });

    describe('when there is only a commit sha', function () {
      it('should return a map with pull request number and team name', async function () {
        // given
        const repoOwner = 'github-owner';
        const repoName = 'github-repository';
        const commitShas = ['commitSHA1', 'commitSHA2'];

        const listPullRequestsAssociatedWithCommitStub = sinon.stub().resolves({
          data: [
            {
              number: 1327,
              labels: [{ name: 'team-devcomp' }, { name: 'team-prescription' }, { name: 'other-label' }],
            },
          ],
        });

        const octokitStub = sinon.stub().returns({
          repos: {
            listPullRequestsAssociatedWithCommit: listPullRequestsAssociatedWithCommitStub,
          },
        });

        // when
        const pullRequestsDetails = await getPullRequestsFromCommitsShas({
          repoOwner,
          repoName,
          commitShas,
          createOctokit: octokitStub,
        });

        // then
        const expectedPullRequests = new Map([[1327, ['team-devcomp', 'team-prescription']]]);
        expect(pullRequestsDetails).to.deep.equal(expectedPullRequests);
        expect(listPullRequestsAssociatedWithCommitStub.calledTwice).to.be.true;
      });

      it('should return an empty array', async function () {
        // given
        const repoOwner = 'github-owner';
        const repoName = 'github-repository';
        const commitShas = ['commitSHA1', 'commitSHA2', 'commitSHA3'];

        const listPullRequestsAssociatedWithCommitStub = sinon.stub().resolves({
          data: [],
        });
        const octokitStub = sinon.stub().returns({
          repos: {
            listPullRequestsAssociatedWithCommit: listPullRequestsAssociatedWithCommitStub,
          },
        });

        // when
        const pullRequestsDetails = await getPullRequestsFromCommitsShas({
          repoOwner,
          repoName,
          commitShas,
          createOctokit: octokitStub,
        });

        // then
        const expectedPullRequestsDetails = new Map([]);
        expect(pullRequestsDetails).to.deep.equal(expectedPullRequestsDetails);
        expect(listPullRequestsAssociatedWithCommitStub.calledThrice).to.be.true;
      });
    });
  });
});
