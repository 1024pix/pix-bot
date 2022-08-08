const openModalReleasePublicationConfirmation = require('./surfaces/modals/publish-release/release-publication-confirmation');
const { environments, deploy, publish } = require('../../../common/services/releases');
const githubService = require('../../../common/services/github');

module.exports = {
  async submitReleaseTypeSelection(payload) {
    const releaseType = payload.view.state.values['publish-release-type']['release-type-option'].selected_option.value;
    const hasConfigFileChanged = await githubService.hasConfigFileChangedSinceLatestRelease();
    return openModalReleasePublicationConfirmation(releaseType, hasConfigFileChanged);
  },

  submitReleaseTypeSelectionCallbackId: openModalReleasePublicationConfirmation.callbackId,

  submitReleasePublicationConfirmation(payload) {
    const releaseType = payload.view.private_metadata;

    async function _publishAndDeploy({ releaseType, environment }) {
      await publish(releaseType);
      const latestReleaseTag = await githubService.getLatestReleaseTag();
      return deploy(environment, latestReleaseTag);
    }

    _publishAndDeploy({ releaseType, environment: environments.recette });
    return {
      response_action: 'clear',
    };
  },
};
