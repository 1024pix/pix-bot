const commands = require('../services/slack/commands');
const shortcuts = require('../services/slack/shortcuts');
const viewSubmissions = require('../services/slack/view-submissions');

module.exports = {

   deployRelease(request, h) {
    const payload = request.pre.payload;

    commands.deployRelease(payload);

    return {
      "text": "Message bien reçu."
    };
  },

  interactiveEndpoint(request, h) {
    const payload = JSON.parse(request.payload.payload);

    console.log(payload);

    const interactionType = payload.type;

    switch (interactionType) {
      case 'shortcut':
        if (payload.callback_id === 'deploy-release') {
          shortcuts.openViewDeployReleaseNumberSelection(payload);
        }
        return null;
      case 'view_submission':
        if (payload.view.callback_id === 'release-number-selection') {
          return viewSubmissions.submitReleaseNumberSelection(payload);
        }
        if (payload.view.callback_id === 'release-deployment-confirmation') {
          return viewSubmissions.submitReleaseDeploymentConfirmation(payload);
        }
        return null;
      case 'view_closed':
      case 'block_actions':
      default:
        console.log('This kind of interaction is not yet supported.');
    }
  },

};
