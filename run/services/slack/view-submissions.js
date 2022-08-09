const openModalReleaseDeploymentConfirmation = require('./surfaces/modals/deploy-release/release-deployment-confirmation');
const { environments, deploy } = require('../../../common/services/releases');
const githubService = require('../../../common/services/github');
const slackPostMessageService = require('../../../common/services/slack/surfaces/messages/post-message');

module.exports = {
  async submitReleaseTagSelection(payload) {
    const releaseTag = payload.view.state.values['deploy-release-tag']['release-tag-value'].value;
    const hasConfigFileChanged = await githubService.hasConfigFileChangedInLatestRelease();
    return openModalReleaseDeploymentConfirmation(releaseTag, hasConfigFileChanged);
  },

  submitReleaseTagSelectionCallbackId: openModalReleaseDeploymentConfirmation.callbackId,

  submitReleaseDeploymentConfirmation(payload) {
    const releaseTag = payload.view.private_metadata;
    if (!githubService.isBuildStatusOK({ tagName: releaseTag.trim().toLowerCase() })) {
      slackPostMessageService.postMessage('MEP bloquée. Etat de l‘environnement de recette à vérifier.');
    } else {
      deploy(environments.production, releaseTag);
    }
    return {
      response_action: 'clear',
    };
  },
};
