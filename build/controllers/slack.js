const github = require('../../common/services/github');
const { environments, deploy, publish } = require('../../common/services/releases');
const shortcuts = require('../services/slack/shortcuts');
const viewSubmissions = require('../services/slack/view-submissions');
const slackPostMessageService = require('../../common/services/slack/surfaces/messages/post-message');
const sendSlackBlockMessage = require('../../common/services/slack/surfaces/messages/block-message');
const logger = require('../../common/services/logger');

const _ = require('lodash');

module.exports = {
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

    publish('patch', branchName).then(async (latestReleaseTag) => {
      await deploy(environments.recette, latestReleaseTag);
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
    slackPostMessageService.postMessage('MER bloquée. Etat de l‘environnement d‘intégration à vérifier.');
    return {
      response_action: 'clear',
    };
  },
};
