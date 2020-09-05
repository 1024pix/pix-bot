const commands = require('../services/slack/commands');
const shortcuts = require('../services/slack/shortcuts');
const viewSubmissions = require('../services/slack/view-submissions');
const github = require('../services/github');
const googleSheet = require('../services/google-sheet');


function _getDeployStartedMessage(release, appName) {
  return `Commande de déploiement de la release "${release}" pour ${appName} en production bien reçue.`;
}

module.exports = {

  createAndDeployPixSiteRelease(request) {
    const payload = request.pre.payload;
    commands.createAndDeployPixSiteRelease(payload);

    return {
      'text': _getDeployStartedMessage(payload.text, 'PIX site')
    };
  },

  createAndDeployPixProRelease(request) {
    const payload = request.pre.payload;
    commands.createAndDeployPixProRelease(payload);

    return {
      'text': _getDeployStartedMessage(payload.text, 'PIX pro')
    };
  },

  createAndDeployPixBotTestRelease(request) {
    const payload = request.pre.payload;
    commands.createAndDeployPixBotTestRelease(payload);

    return {
      'text': _getDeployStartedMessage(payload.text, 'PIX bot test (repo vide)')
    };
  },

  createAndDeployPixUIRelease(request) {
    const payload = request.pre.payload;
    commands.createAndDeployPixUI(payload);

    return {
      'text': _getDeployStartedMessage(payload.text, 'PIX UI')
    };
  },

  createAndDeployPixLCMSRelease(request) {
    const payload = request.pre.payload;
    commands.createAndDeployPixLCMS(payload);

    return {
      'text': _getDeployStartedMessage(payload.text, 'PIX LCMS')
    };
  },

  interactiveEndpoint(request) {
    const payload = request.pre.payload;

    const interactionType = payload.type;

    switch (interactionType) {
    case 'shortcut':
      if (payload.callback_id === 'publish-release') {
        shortcuts.openViewPublishReleaseTypeSelection(payload);
      }
      if (payload.callback_id === 'deploy-release') {
        shortcuts.openViewDeployReleaseTagSelection(payload);
      }
      return null;
    case 'view_submission':
      if (payload.view.callback_id === 'release-type-selection') {
        return viewSubmissions.submitReleaseTypeSelection(payload);
      }
      if (payload.view.callback_id === 'release-publication-confirmation') {
        return viewSubmissions.submitReleasePublicationConfirmation(payload);
      }
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
      console.log('This kind of interaction is not yet supported by Pix Bot.');
      return null;
    }
  },

  async getPullRequests(request) {
    const label = request.pre.payload.text;
    return github.getPullRequests(label);
  },

  async getAccessibilityTip() {
    return googleSheet.getA11YTip();
  }

};
