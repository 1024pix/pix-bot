import * as _ from 'lodash';

import github from '../../common/services/github.js';
import { logger } from '../../common/services/logger.js';
import releases from '../../common/services/releases.js';
import * as sendSlackBlockMessage from '../../common/services/slack/surfaces/messages/block-message.js';
import slackPostMessageService from '../../common/services/slack/surfaces/messages/post-message.js';
import shortcuts from '../services/slack/shortcuts.js';
import viewSubmissions from '../services/slack/view-submissions.js';

const slack = {
  async getPullRequests(request) {
    const label = request.pre.payload.text;
    return github.getPullRequests(label);
  },

  async getChangelogSinceLatestRelease() {
    const prTitlesList = await github.getChangelogSinceLatestRelease();
    return {
      response_type: 'in_channel',
      text: prTitlesList.join('\n'),
    };
  },

  startMobRoles(request) {
    const payload = request.pre.payload;
    const participants = payload.text.split(' ');

    logger.info({
      event: 'slack',
      message: payload,
    });

    const organizer = `@${payload.user_name}`;
    participants.push(organizer);
    const shuffledParticipants = _.shuffle(participants);

    const message = shuffledParticipants.map((participant, index) => {
      const nextParticipant = shuffledParticipants[index + 1] ?? shuffledParticipants[0];
      return `tour ${index + 1} \n pilote : ${participant} \n copilote : ${nextParticipant} \n `;
    });

    return sendSlackBlockMessage(message.join('\n'));
  },

  createAndDeployPixHotfix(request) {
    const payload = request.pre.payload;
    const branchName = payload.text;

    releases.publish('patch', branchName).then(async (latestReleaseTag) => {
      await releases.deploy(releases.environments.recette, latestReleaseTag);
    });

    return {
      text: 'Commande de déploiement de hotfix de PIX en recette.',
    };
  },

  interactiveEndpoint(request) {
    const payload = request.pre.payload;

    const interactionType = payload.type;

    const releaseBranch = 'dev';

    switch (interactionType) {
      case 'shortcut':
        if (payload.callback_id === 'publish-release') {
          if (!github.isBuildStatusOK({ branchName: releaseBranch })) {
            return this._interruptRelease();
          }
          shortcuts.openViewPublishReleaseTypeSelection(payload);
        }
        return null;
      case 'view_submission':
        if (payload.view.callback_id === shortcuts.openViewPublishReleaseTypeSelectionCallbackId) {
          return viewSubmissions.submitReleaseTypeSelection(payload);
        }
        if (payload.view.callback_id === viewSubmissions.submitReleaseTypeSelectionCallbackId) {
          return viewSubmissions.submitReleasePublicationConfirmation(payload);
        }
        return null;
      case 'view_closed':
      case 'block_actions':
      default:
        logger.warn({
          event: 'slack',
          message: 'This kind of interaction is not yet supported by Pix Bot.',
        });

        return null;
    }
  },

  _interruptRelease() {
    const message = 'MER bloquée. Etat de l‘environnement d‘intégration à vérifier.';
    slackPostMessageService.postMessage({ message });
    return {
      response_action: 'clear',
    };
  },
};

export default slack;
