const commands = require('../services/slack/commands');
const shortcuts = require('../services/slack/shortcuts');
const viewSubmissions = require('../services/slack/view-submissions');

module.exports = {

  publishRelease(request) {
    const payload = request.pre.payload;

    commands.publishRelease(payload);

    return {
      "text": "Commande de publication d'une release bien reçue."
    };
  },

  createAndDeployPixSiteRelease(request, h) {
    const payload = request.pre.payload;

    commands.createAndDeployPixSiteRelease(payload);

    return {
      "text": "Commande de déploiement en production bien reçue."
    };
  },

  interactiveEndpoint(request) {
    const payload = request.pre.payload;

    const interactionType = payload.type;

    switch (interactionType) {
      case 'shortcut':
        if (payload.callback_id === 'deploy-release') {
          shortcuts.openViewDeployReleaseTagSelection(payload);
        }
        return null;
      case 'view_submission':
        if (payload.view.callback_id === 'release-tag-selection') {
          return viewSubmissions.submitReleaseTagSelection(payload);
        }
        if (payload.view.callback_id === 'release-deployment-confirmation') {
          return viewSubmissions.submitReleaseDeploymentConfirmation(payload);
        }
        return null;
      case 'view_closed':
      case 'block_actions':
      default:
        console.log('This kind of interaction is not yet supported by SAM.');
        return null;
    }
  },

};
