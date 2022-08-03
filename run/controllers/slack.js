const commands = require('../services/slack/commands');
const { getAppStatusFromScalingo } = require('../services/slack/app-status-from-scalingo');
const sendSlackBlockMessage = require('../../common/services/slack/surfaces/messages/block-message');
const shortcuts = require('../services/slack/shortcuts');
const viewSubmissions = require('../services/slack/view-submissions');

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

  createAndDeployPixTutosRelease(request) {
    const payload = request.pre.payload;
    commands.createAndDeployPixTutosRelease(payload);

    return {
      'text': _getDeployStartedMessage(payload.text, 'PIX Tutos')
    };
  },

  createAndDeployPix360Release(request) {
    const payload = request.pre.payload;
    commands.createAndDeployPix360Release(payload);

    return {
      'text': _getDeployStartedMessage(payload.text, 'Pix 360')
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

  createAndDeployDbStats(request) {
    const payload = request.pre.payload;
    commands.createAndDeployDbStats(payload);

    return {
      'text': _getDeployStartedMessage(payload.text, 'DB stats')
    };
  },

  deployMetabase() {
    commands.deployMetabase();

    return {
      text: 'Commande de déploiement de Metabase en production bien reçue.',
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
};
