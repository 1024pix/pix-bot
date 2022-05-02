const shortcuts = require('../services/slack/shortcuts');
const viewSubmissions = require('../services/slack/view-submissions');
const github = require('../services/github');
const postSlackMessage = require('../services/slack/surfaces/messages/post-message');

module.exports = {

  interactiveEndpoint(request) {
    const payload = request.pre.payload;

    const interactionType = payload.type;

    const releaseBranch = 'dev';

    switch (interactionType) {
    case 'shortcut':
      if (payload.callback_id === 'publish-release') {
        if(!github.isBuildStatusOK({ branchName: releaseBranch })) {
          return this._interruptRelease();
        }
        shortcuts.openViewPublishReleaseTypeSelection(payload);
      }
      if (payload.callback_id === 'deploy-release') {
        shortcuts.openViewDeployReleaseTagSelection(payload);
      }
      return null;
    case 'view_submission':
      if (payload.view.callback_id === shortcuts.openViewPublishReleaseTypeSelectionCallbackId) {
        return viewSubmissions.submitReleaseTypeSelection(payload);
      }
      if (payload.view.callback_id === viewSubmissions.submitReleaseTypeSelectionCallbackId) {
        return viewSubmissions.submitReleasePublicationConfirmation(payload);
      }
      if (payload.view.callback_id === shortcuts.openViewDeployReleaseTagSelectionCallbackId) {
        return viewSubmissions.submitReleaseTagSelection(payload);
      }
      if (payload.view.callback_id === viewSubmissions.submitReleaseTagSelectionCallbackId) {
        return viewSubmissions.submitReleaseDeploymentConfirmation(payload);
      }
      return null;
    case 'view_closed':
    case 'block_actions':
    default:
      console.log('This kind of interaction is not yet supported by Pix Bot.');
      return null;
    }
  },

  _interruptRelease() {
    postSlackMessage('MER bloquée. Etat de l‘environnement d‘intégration à vérifier.');
    return {
      'response_action': 'clear'
    };
  },

};
