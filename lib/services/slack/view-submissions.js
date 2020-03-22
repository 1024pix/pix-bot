const openModalReleaseDeploymentConfirmation = require('./surfaces/modals/deploy-release/deploy-release-confirmation');

module.exports = {

  submitReleaseNumberSelection(payload) {
    const releaseTag = payload.view.state.values["deploy-release-number"]["release-number-value"].value;
    return openModalReleaseDeploymentConfirmation(releaseTag);
  },

  submitReleaseDeploymentConfirmation(payload) {
    return {
      "response_action": "clear"
    };
  }
};
