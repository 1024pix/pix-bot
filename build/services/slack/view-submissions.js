const openModalReleasePublicationConfirmation = require('./surfaces/modals/publish-release/release-publication-confirmation');
const { environments, deploy, publish } = require('../../../common/services/releases');
const githubService = require('../../../common/services/github');
const config = require('../../../config');

module.exports = {
  async submitReleaseTypeSelection(payload) {
    const releaseType = payload.view.state.values['publish-release-type']['release-type-option'].selected_option.value;
    const configFilesChangedCommits = await githubService.getConfigFileChangedCommitsSinceLatestRelease();
    const hasConfigFileChanged = configFilesChangedCommits.length > 0;
    let pullRequestNumbers = new Set();
    let teamLabels = new Set();
    if (hasConfigFileChanged) {
      const pullRequests = await githubService.getPullRequestsFromCommitsShas(
        config.github.owner,
        config.github.repository,
        configFilesChangedCommits.map((commit) => commit.sha),
      );

      for (const [pullRequestNumber, pullRequestsTeamLabels] of pullRequests) {
        pullRequestNumbers.add(pullRequestNumber);
        for (const teamLabel of pullRequestsTeamLabels) {
          teamLabels.add(teamLabel);
        }
      }
    }

    return openModalReleasePublicationConfirmation(releaseType, hasConfigFileChanged, {
      pullRequestNumbers: Array.from(pullRequestNumbers),
      teamLabels: Array.from(teamLabels),
    });
  },

  submitReleaseTypeSelectionCallbackId: openModalReleasePublicationConfirmation.callbackId,

  submitReleasePublicationConfirmation(payload) {
    const releaseType = payload.view.private_metadata;

    async function _publishAndDeploy({ releaseType, environment }) {
      const latestReleaseTag = await publish(releaseType);
      return deploy(environment, latestReleaseTag);
    }

    _publishAndDeploy({ releaseType, environment: environments.recette });
    return {
      response_action: 'clear',
    };
  },
};
