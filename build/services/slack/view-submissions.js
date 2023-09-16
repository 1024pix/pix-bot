const openModalReleasePublicationConfirmation = require('./surfaces/modals/publish-release/release-publication-confirmation');
const { environments, deploy, publish } = require('../../../common/services/releases');
const githubService = require('../../../common/services/github');
const slackPostMessageService = require('../../../common/services/slack/surfaces/messages/post-message');

module.exports = {
  async submitReleaseTypeSelection(payload) {
    const releaseType = payload.view.state.values['publish-release-type']['release-type-option'].selected_option.value;
    const { hasConfigFileChanged, latestTag } = await githubService.hasConfigFileChangedSinceLatestRelease();
    if (hasConfigFileChanged) {
      const message =
        ':warning: Il y a eu des ajout(s)/suppression(s) ' +
        `<https://github.com/1024pix/pix/compare/${latestTag}...dev|dans le fichier config.js>. ` +
        "Pensez à vérifier que toutes les variables d'environnement sont bien à jour sur *Scalingo RECETTE*.";
      await slackPostMessageService.postMessage({
        message,
        channel: '#tech-releases',
      });
    }
    return openModalReleasePublicationConfirmation({ releaseType, hasConfigFileChanged, latestTag });
  },

  submitReleaseTypeSelectionCallbackId: openModalReleasePublicationConfirmation.callbackId,

  submitReleasePublicationConfirmation(payload) {
    const releaseType = payload.view.private_metadata;

    async function _publishAndDeploy({ releaseType, environment }) {
      const latestReleaseTag = await publish(releaseType);
      return deploy(environment, latestReleaseTag);
    }

    _publishAndDeploy({ releaseType, environment: environments.recette });
    return {
      response_action: 'clear',
    };
  },
};
