const openModalReleaseDeploymentConfirmation = require('./surfaces/modals/deploy-release/deploy-release-confirmation');
const { deploy } = require('../releases');

module.exports = {

  submitReleaseNumberSelection(payload) {
    const releaseTag = payload.view.state.values["deploy-release-number"]["release-number-value"].value;
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
