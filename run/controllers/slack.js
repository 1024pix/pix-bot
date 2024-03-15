import * as commands from '../services/slack/commands.js';
import { getAppStatusFromScalingo } from '../services/slack/app-status-from-scalingo.js';
import * as sendSlackBlockMessage from '../../common/services/slack/surfaces/messages/block-message.js';
import shortcuts from '../services/slack/shortcuts.js';
import viewSubmissions from '../services/slack/view-submissions.js';
import * as logger from '../../common/services/logger.js';

function _getDeployStartedMessage(release, appName) {
  return `Commande de déploiement de la release "${release}" pour ${appName} en production bien reçue.`;
}

const slack = {
  deployAirflow(request) {
    const payload = request.pre.payload;
    commands.deployAirflow(payload);

    return {
      text: _getDeployStartedMessage(payload.text, 'Airflow'),
    };
  },

  deployDBT(request) {
    const payload = request.pre.payload;
    commands.deployDBT(payload);

    return {
      text: _getDeployStartedMessage(payload.text, 'DBT'),
    };
  },

  createAndDeployPixSiteRelease(request) {
    const payload = request.pre.payload;
    commands.createAndDeployPixSiteRelease(payload);

    return {
      text: _getDeployStartedMessage(payload.text, 'PIX site and pro'),
    };
  },

  createAndDeployPixUIRelease(request) {
    const payload = request.pre.payload;
    commands.createAndDeployPixUI(payload);

    return {
      text: _getDeployStartedMessage(payload.text, 'PIX UI'),
    };
  },

  createAndDeployPixLCMSRelease(request) {
    const payload = request.pre.payload;
    commands.createAndDeployPixLCMS(payload);

    return {
      text: _getDeployStartedMessage(payload.text, 'PIX LCMS'),
    };
  },

  createAndDeployPixAPIDataRelease(request) {
    const payload = request.pre.payload;
    commands.createAndDeployPixAPIData(payload);

    return {
      text: _getDeployStartedMessage(payload.text, 'PIX API DATA'),
    };
  },

  createAndDeployPixDatawarehouseRelease(request) {
    const payload = request.pre.payload;
    commands.createAndDeployPixDatawarehouse(payload);

    return {
      text: _getDeployStartedMessage(payload.text, 'PIX Datawarehouse'),
    };
  },

  createAndDeployPixBotRelease(request) {
    const payload = request.pre.payload;
    commands.createAndDeployPixBotRelease(payload);

    return {
      text: _getDeployStartedMessage(payload.text, 'PIX Bot'),
    };
  },

  createAndDeployPixTutosRelease(request) {
    const payload = request.pre.payload;
    commands.createAndDeployPixTutosRelease(payload);

    return {
      text: _getDeployStartedMessage(payload.text, 'PIX Tutos'),
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
    } catch (e) {
      return sendSlackBlockMessage(e.message);
    }

    return sendSlackBlockMessage(`Re-déploiement de ${appName} déclenché`);
  },

  createAndDeployEmberTestingLibraryRelease(request) {
    const payload = request.pre.payload;
    commands.createAndDeployEmberTestingLibrary(payload);

    return {
      text: _getDeployStartedMessage(payload.text, 'EMBER-TESTING-LIBRARY'),
    };
  },

  createAndDeployDbStats(request) {
    const payload = request.pre.payload;
    commands.createAndDeployDbStats(payload);

    return {
      text: _getDeployStartedMessage(payload.text, 'DB stats'),
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
        if (payload.callback_id === 'scalingo-app-creation') {
          shortcuts.openViewCreateAppOnScalingoSelection(payload);
        }
        return null;
      case 'view_submission':
        if (payload.view.callback_id === shortcuts.openViewDeployReleaseTagSelectionCallbackId) {
          return viewSubmissions.submitReleaseTagSelection(payload);
        }
        if (payload.view.callback_id === shortcuts.openViewCreateAppOnScalingoSelectionCallbackId) {
          return viewSubmissions.submitApplicationNameSelection(payload);
        }
        if (payload.view.callback_id === viewSubmissions.submitReleaseTagSelectionCallbackId) {
          return viewSubmissions.submitReleaseDeploymentConfirmation(payload);
        }
        if (payload.view.callback_id === viewSubmissions.submitApplicationNameSelectionCallbackId) {
          return viewSubmissions.submitCreateAppOnScalingoConfirmation(payload);
        }
        return null;
      case 'view_closed':
      case 'block_actions':
      default:
        logger.info({ event: 'slack', message: 'This kind of interaction is not yet supported by Pix Bot.' });
        return null;
    }
  },
};

export default slack;
