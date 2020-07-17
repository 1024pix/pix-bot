const openModalReleasePublicationConfirmation = require('./surfaces/modals/publish-release/release-publication-confirmation');
const openModalReleaseDeploymentConfirmation = require('./surfaces/modals/deploy-release/release-deployment-confirmation');
const { environments, deploy, publish } = require('../releases');
const githubService = require('../github');

module.exports = {

  // Release publication

  submitReleaseTypeSelection(payload) {
    const releaseType = payload.view.state.values['publish-release-type']['release-type-option'].selected_option.value;
    return openModalReleasePublicationConfirmation(releaseType);
  },

  submitReleasePublicationConfirmation(payload) {
    const releaseType = payload.view.private_metadata;

    async function _publishAndDeploy({ releaseType, environment }) {
      await publish(releaseType);
      const latestReleaseTag = await githubService.getLatestReleaseTag();
      return deploy(environment, latestReleaseTag);
    }

    _publishAndDeploy({ releaseType, environment: environments.recette });
    return {
      'response_action': 'clear'
    };
  },

  // Release deployment

  submitReleaseTagSelection(payload) {
    const releaseTag = payload.view.state.values['deploy-release-tag']['release-tag-value'].value;
    return openModalReleaseDeploymentConfirmation(releaseTag);
  },

  submitReleaseDeploymentConfirmation(payload) {
    const releaseTag = payload.view.private_metadata;
    deploy(environments.production, releaseTag);
    return {
      'response_action': 'clear'
    };
  }
};
