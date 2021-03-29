const commandsFromRun = require('../../run/services/slack/commands');
const { getAppStatusFromScalingo } = require('../../run/services/slack/app-status-from-scalingo');
const shortcuts = require('../services/slack/shortcuts');
const viewSubmissions = require('../services/slack/view-submissions');
const github = require('../services/github');
const postSlackMessage = require('../services/slack/surfaces/messages/post-message');

function _getDeployStartedMessage(release, appName) {
  return `Commande de déploiement de la release "${release}" pour ${appName} en production bien reçue.`;
}

module.exports = {

  createAndDeployPixSiteRelease(request) {
    const payload = request.pre.payload;
    commandsFromRun.createAndDeployPixSiteRelease(payload);

    return {
      'text': _getDeployStartedMessage(payload.text, 'PIX site and pro')
    };
  },

  createAndDeployPixBotTestRelease(request) {
    const payload = request.pre.payload;
    commandsFromRun.createAndDeployPixBotTestRelease(payload);

    return {
      'text': _getDeployStartedMessage(payload.text, 'PIX bot test (repo vide)')
    };
  },

  createAndDeployPixUIRelease(request) {
    const payload = request.pre.payload;
    commandsFromRun.createAndDeployPixUI(payload);

    return {
      'text': _getDeployStartedMessage(payload.text, 'PIX UI')
    };
  },

  createAndDeployPixBotRelease(request) {
    const payload = request.pre.payload;
    commandsFromRun.createAndDeployPixBotRelease(payload);

    return {
      'text': _getDeployStartedMessage(payload.text, 'PIX Bot')
    };
  },

  createAndDeployPixLCMSRelease(request) {
    const payload = request.pre.payload;
    commandsFromRun.createAndDeployPixLCMS(payload);

    return {
      'text': _getDeployStartedMessage(payload.text, 'PIX LCMS')
    };
  },

  createAndDeployPixDatawarehouseRelease(request) {
    const payload = request.pre.payload;
    commandsFromRun.createAndDeployPixDatawarehouse(payload);

    return {
      'text': _getDeployStartedMessage(payload.text, 'PIX Datawarehouse')
    };
  },

  getAppStatus(request) {
    const appName= request.pre.payload.text;
    return getAppStatusFromScalingo(appName);
  },

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

  _interruptRelease() {
    postSlackMessage('MER bloquée. Etat de l‘environnement d‘intégration à vérifier.');
    return {
      'response_action': 'clear'
    };
  },

};
