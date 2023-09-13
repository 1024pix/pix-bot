const openModalReleasePublicationConfirmation = require('./surfaces/modals/publish-release/release-publication-confirmation');
const { environments, deploy, publish } = require('../../../common/services/releases');
const githubService = require('../../../common/services/github');

module.exports = {
  async submitReleaseTypeSelection(payload) {
    const releaseType = payload.view.state.values['publish-release-type']['release-type-option'].selected_option.value;
    const { hasConfigFileChanged, latestTag } = await githubService.hasConfigFileChangedSinceLatestRelease();
    return openModalReleasePublicationConfirmation({ releaseType, hasConfigFileChanged, latestTag });
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
