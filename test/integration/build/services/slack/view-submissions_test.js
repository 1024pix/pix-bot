const { expect, sinon } = require('../../../../test-helper');
const githubService = require('../../../../../common/services/github');
const config = require('../../../../../config');

const { submitReleaseTypeSelection } = require('../../../../../build/services/slack/view-submissions');

describe('Integration | Build | Services | Slack  | View Submissions', function () {
  afterEach(function () {
    sinon.restore();
  });

  describe('#submitReleaseTypeSelection', function () {
    describe('When config file has changed', function () {
      it('should display a modal', async function () {
        // given
        sinon.stub(config, 'github').value({ owner: 'fake-owner', repository: 'fake-repository' });
        const payload = {
          view: {
            state: {
              values: {
                'publish-release-type': {
                  'release-type-option': {
                    selected_option: {
                      value: 'major',
                    },
                  },
                },
              },
            },
          },
        };
        const commitsWithChangedConfigFiles = [
          {
            sha: '5ec2f42',
          },
          {
            sha: 'tg6riu7',
          },
          {
            sha: 'hj9iTR4',
          },
        ];

        const getCommitsWithChangedConfigFileSinceLatestReleaseStub = sinon
          .stub(githubService, 'getCommitsWithChangedConfigFileSinceLatestRelease')
          .resolves(commitsWithChangedConfigFiles);
        //const getPullRequestsFromCommitsShasStub = sinon.stub(githubService, 'getPullRequestsFromCommitsShas');
        const getPullRequestsFromCommitsShasStub = sinon.stub();

        // when
        const result = await submitReleaseTypeSelection(payload);

        // then
        expect(result.response_action).to.deep.equal('push');
        expect(getCommitsWithChangedConfigFileSinceLatestReleaseStub.calledOnce).to.be.true;
        expect(getPullRequestsFromCommitsShasStub.calledOnce).to.be.true;
        expect(getPullRequestsFromCommitsShasStub.firstCall.args[0]).to.deep.equal({
          commitShas: commitsWithChangedConfigFiles,
          repoName: 'fake-repository',
          repoOwner: 'fake-owner',
        });
      });
    });
  });
});
