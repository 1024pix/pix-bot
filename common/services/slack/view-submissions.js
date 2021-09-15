const openModalReleasePublicationConfirmation = require('../../../build/services/slack/surfaces/modals/publish-release/release-publication-confirmation');
const openModalReleaseDeploymentConfirmation = require('../../../run/services/slack/surfaces/modals/deploy-release/release-deployment-confirmation');
const postSlackMessage = require('./surfaces/messages/post-message');
const { environments, deploy, publish } = require('../releases');
const githubService = require('../github');

module.exports = {

  // Release publication

  async submitReleaseTypeSelection(payload) {
    const releaseType = payload.view.state.values['publish-release-type']['release-type-option'].selected_option.value;
    const hasConfigFileChanged = await githubService.hasConfigFileChangedSinceLatestRelease();
    return openModalReleasePublicationConfirmation(releaseType, hasConfigFileChanged);
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

  async submitReleaseTagSelection(payload) {
    const releaseTag = payload.view.state.values['deploy-release-tag']['release-tag-value'].value;
    const hasConfigFileChanged = await githubService.hasConfigFileChangedSinceLatestRelease();
    return openModalReleaseDeploymentConfirmation(releaseTag, hasConfigFileChanged);
  },

  submitReleaseDeploymentConfirmation(payload) {
    const releaseTag = payload.view.private_metadata;
    if(!githubService.isBuildStatusOK({ tagName: releaseTag.trim().toLowerCase() })) {
      postSlackMessage('MEP bloquée. Etat de l‘environnement de recette à vérifier.');
    }
    else {
      deploy(environments.production, releaseTag);
    }
    return {
      'response_action': 'clear'
    };
  }
};
