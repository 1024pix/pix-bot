import { logger } from '../../../common/services/logger.js';
import githubService from '../../../common/services/github.js';
import slackPostMessage from '../../../common/services/slack/surfaces/messages/post-message.js';
import { getStatus } from '../../../common/repositories/release-settings.repository.js';
import { config } from '../../../config.js';
import releasesService from '../../../common/services/releases.js';

async function run({ repository, dependencies = { github: githubService, _postMessage, getStatus, releasesService } }) {
  logger.info({
    event: 'release production',
    message: `Starting ${repository} release in production.`,
  });
  try {
    const releaseTag = await dependencies.github.getLatestReleaseTag();
    const buildStatus = await dependencies.github.isBuildStatusOK({ tagName: releaseTag.trim().toLowerCase() });
    if (!buildStatus) {
      logger.info({
        event: 'release production',
        message: `Build status is not OK for ${repository} release in production.`,
      });
      await dependencies._postMessage(
        "Impossible de lancer la mise en production. Veuillez consulter les logs pour plus d'informations",
      );
      return;
    }
    const { authorizeDeployment, blockReason } = await dependencies.getStatus({ repositoryName: 'pix' });
    if (!authorizeDeployment) {
      await dependencies._postMessage(`Rappel: la Mise en production est bloquée. Motif: ${blockReason}`);
      return;
    }
    await dependencies._postMessage(`Hello :salut_main: Je lanse la mise en production de la ${releaseTag} !`);
    dependencies.releasesService.deploy(dependencies.releasesService.environments.production, releaseTag);
  } catch (error) {
    logger.error({
      event: 'release production',
      message: `Error while starting ${repository} release in production.`,
      error,
    });
    dependencies._postMessage(
      "Impossible de lancer la mise en production. Veuillez consulter les logs pour plus d'informations",
    );
  }
}

export { run };

function _postMessage(message) {
  return slackPostMessage.postMessage({
    message,
    token: config.slack.releaseBotToken,
    channel: config.slack.releaseChannelId,
  });
}
