const openModalReleasePublicationConfirmation = require('./surfaces/modals/publish-release/release-publication-confirmation');
const openModalReleaseDeploymentConfirmation = require('./surfaces/modals/deploy-release/release-deployment-confirmation');
const { deploy, publish } = require('../releases');

module.exports = {

  // Release publication

  submitReleaseTypeSelection(payload) {
    const releaseType = payload.view.state.values["publish-release-type"]["release-type-option"].selected_option.value;
    return openModalReleasePublicationConfirmation(releaseType);
  },

  submitReleasePublicationConfirmation(payload) {
    const releaseType = payload.view.private_metadata;
    publish(releaseType);
    return {
      "response_action": "clear"
    };
  },

  // Release deployment

  submitReleaseTagSelection(payload) {
    const releaseTag = payload.view.state.values["deploy-release-tag"]["release-tag-value"].value;
    return openModalReleaseDeploymentConfirmation(releaseTag);
  },

  submitReleaseDeploymentConfirmation(payload) {
    const releaseTag = payload.view.private_metadata;
    deploy(releaseTag);
    return {
      "response_action": "clear"
    };
  }
};
