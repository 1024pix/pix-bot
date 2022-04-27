const commands = require('../services/slack/commands');
const { getAppStatusFromScalingo } = require('../services/slack/app-status-from-scalingo');
const sendSlackBlockMessage = require('../../common/services/slack/surfaces/messages/block-message');

function _getDeployStartedMessage(release, appName) {
  return `Commande de déploiement de la release "${release}" pour ${appName} en production bien reçue.`;
}

module.exports = {

  createAndDeployPixSiteRelease(request) {
    const payload = request.pre.payload;
    commands.createAndDeployPixSiteRelease(payload);

    return {
      'text': _getDeployStartedMessage(payload.text, 'PIX site and pro')
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

  createAndDeployPixDatawarehouseRelease(request) {
    const payload = request.pre.payload;
    commands.createAndDeployPixDatawarehouse(payload);

    return {
      'text': _getDeployStartedMessage(payload.text, 'PIX Datawarehouse')
    };
  },

  createAndDeployPixBotRelease(request) {
    const payload = request.pre.payload;
    commands.createAndDeployPixBotRelease(payload);

    return {
      'text': _getDeployStartedMessage(payload.text, 'PIX Bot')
    };
  },

  getAppStatus(request) {
    const appName = request.pre.payload.text;
    return getAppStatusFromScalingo(appName);
  },

  async deployLastVersion(request) {
    const appName = request.pre.payload.text;

    try {
      await commands.getAndDeployLastVersion({ appName });
    } catch(e) {
      return sendSlackBlockMessage(e.message);
    }

    return sendSlackBlockMessage(`Re-déploiement de ${appName} déclenché`);
  },

  createAndDeployEmberTestingLibraryRelease(request) {
    const payload = request.pre.payload;
    commands.createAndDeployEmberTestingLibrary(payload);

    return {
      'text': _getDeployStartedMessage(payload.text, 'EMBER-TESTING-LIBRARY')
    };
  },
};
