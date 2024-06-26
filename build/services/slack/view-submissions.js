import github from '../../../common/services/github.js';
import releases from '../../../common/services/releases.js';
import slackPostMessageService from '../../../common/services/slack/surfaces/messages/post-message.js';
import releasePublicationConfirmationModal from './surfaces/modals/publish-release/release-publication-confirmation.js';

const viewSubmissions = {
  async submitReleaseTypeSelection(payload) {
    const releaseType = payload.view.state.values['publish-release-type']['release-type-option'].selected_option.value;
    const { hasConfigFileChanged, latestTag, pullRequestsForCommitShaDetails } =
      await github.hasConfigFileChangedSinceLatestRelease();

    if (hasConfigFileChanged) {
      let pRsAndTeamLabelsMessageList = 'Les Pr et équipes concernées sont : ';
      pullRequestsForCommitShaDetails.forEach((pullRequestDetails) => {
        pRsAndTeamLabelsMessageList = pRsAndTeamLabelsMessageList.concat(
          `<${pullRequestDetails.html_url}|${pullRequestDetails.labels}> `,
        );
      });

      const message =
        ':warning: Il y a eu des ajout(s)/suppression(s) ' +
        `<https://github.com/1024pix/pix/compare/${latestTag}...dev|dans le fichier config.js>. ` +
        "Pensez à vérifier que toutes les variables d'environnement sont bien à jour sur *Scalingo RECETTE*. " +
        `${pRsAndTeamLabelsMessageList}`;

      await slackPostMessageService.postMessage({
        message,
        channel: '#tech-releases',
      });
    }
    return releasePublicationConfirmationModal.getView({ releaseType, hasConfigFileChanged, latestTag });
  },

  submitReleaseTypeSelectionCallbackId: releasePublicationConfirmationModal.callbackId,

  submitReleasePublicationConfirmation(payload) {
    const releaseType = payload.view.private_metadata;

    async function _publishAndDeploy({ releaseType, environment }) {
      const latestReleaseTag = await releases.publish(releaseType);
      return releases.deploy(environment, latestReleaseTag);
    }

    _publishAndDeploy({ releaseType, environment: releases.environments.recette });
    return {
      response_action: 'clear',
    };
  },
};

export default viewSubmissions;
