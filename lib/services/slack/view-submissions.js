const { Octokit } = require("@octokit/core");
const openModalReleasePublicationConfirmation = require('./surfaces/modals/publish-release/release-publication-confirmation');
const openModalReleaseDeploymentConfirmation = require('./surfaces/modals/deploy-release/release-deployment-confirmation');
const { deploy, publish } = require('../releases');
const settings = require('../../config');

async function _publishAndDeploy({ releaseType, environment }) {
  await publish(releaseType);
  const octokit = new Octokit({ auth: settings.github.token });
  const latestReleaseTag = (await octokit.request('/repos/{owner}/{repo}/tags', {
    owner: 'jbuget',
    repo: 'pix'
  })).data[0].name;
  return deploy(environment, latestReleaseTag);
}

module.exports = {

  // Release publication

  submitReleaseTypeSelection(payload) {
    const releaseType = payload.view.state.values["publish-release-type"]["release-type-option"].selected_option.value;
    return openModalReleasePublicationConfirmation(releaseType);
  },

  submitReleasePublicationConfirmation(payload) {
    const releaseType = payload.view.private_metadata;
    _publishAndDeploy({ releaseType, environment: 'recette' });
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
    deploy('production', releaseTag);
    return {
      "response_action": "clear"
    };
  }
};
