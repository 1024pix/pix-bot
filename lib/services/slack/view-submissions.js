const openModalReleaseDeploymentConfirmation = require('./surfaces/modals/deploy-release/deploy-release-confirmation');
const { deploy } = require('../releases');

module.exports = {

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
