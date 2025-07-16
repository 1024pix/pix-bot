import { ScalingoAppName } from '../../../common/models/ScalingoAppName.js';
import github from '../../../common/services/github.js';
import releasesService from '../../../common/services/releases.js';
import ScalingoClient from '../../../common/services/scalingo-client.js';
import slackPostMessageService from '../../../common/services/slack/surfaces/messages/post-message.js';
import slackGetUserInfos from '../../../common/services/slack/surfaces/user-infos/get-user-infos.js';
import { config } from '../../../config.js';
import releaseDeploymentConfirmationModal from './surfaces/modals/deploy-release/release-deployment-confirmation.js';
import applicationCreationConfirmationModal from './surfaces/modals/scalingo-apps/application-creation-confirmation.js';
import { updateStatus } from '../../../common/repositories/release-settings.repository.js';

const viewSubmissions = {
  async submitReleaseTagSelection(payload) {
    const releaseTag = payload.view.state.values['deploy-release-tag']['release-tag-value'].value;
    const hasConfigFileChanged = await github.hasConfigFileChangedInLatestRelease();
    return releaseDeploymentConfirmationModal.getView(releaseTag, hasConfigFileChanged);
  },

  async submitApplicationNameSelection(payload) {
    const applicationName = payload.view.state.values['create-app-name']['scalingo-app-name'].value;
    const applicationEnvironment = payload.view.state.values['application-env']['item']['selected_option'].value;
    const applicationEnvironmentName =
      payload.view.state.values['application-env']['item']['selected_option']['text']['text'];
    const userEmail = await slackGetUserInfos.getUserEmail(payload.user.id);
    const appSufixList = config.scalingo.validAppSuffix.toString();
    if (!ScalingoAppName.isApplicationNameValid(applicationName)) {
      return {
        response_action: 'errors',
        errors: {
          'create-app-name': `${applicationName} is incorrect, it should start with "${config.scalingo.validAppPrefix}-" and end with one of the following : ${appSufixList}. Also the length should be between ${config.scalingo.validAppNbCharMin} and ${config.scalingo.validAppNbCharMax} characters.`,
        },
      };
    }
    return applicationCreationConfirmationModal.getView(
      applicationName,
      applicationEnvironment,
      applicationEnvironmentName,
      userEmail,
    );
  },

  submitReleaseTagSelectionCallbackId: releaseDeploymentConfirmationModal.callbackId,

  submitApplicationNameSelectionCallbackId: applicationCreationConfirmationModal.callbackId,

  submitReleaseDeploymentConfirmation(payload) {
    const releaseTag = payload.view.private_metadata;
    if (!github.isBuildStatusOK({ tagName: releaseTag.trim().toLowerCase() })) {
      const message = 'MEP bloquée. Etat de l‘environnement de recette à vérifier.';
      slackPostMessageService.postMessage({ message });
    } else {
      releasesService.deploy(releasesService.environments.production, releaseTag);
    }
    return {
      response_action: 'clear',
    };
  },

  async submitCreateAppOnScalingoConfirmation(payload) {
    const { applicationName, applicationEnvironment, userEmail } = JSON.parse(payload.view.private_metadata);
    const client = await ScalingoClient.getInstance(applicationEnvironment);

    const appId = await client.createApplication(applicationName);
    const invitationLink = await client.inviteCollaborator(appId, userEmail);
    if (applicationName.includes('-production')) {
      await client.addDeploymentNotificationOnSlack(applicationName);
      const alertNotifier = await client.addAlertNotificationsOnSlack(applicationName);
      await client.add5xxAlert(applicationName, alertNotifier.id);
    }

    await slackPostMessageService.postMessage({
      message: `app ${applicationName} created <${invitationLink}|invitation link>`,
      channel: `@${payload.user.id}`,
    });
    return {
      response_action: 'clear',
    };
  },

  async submitLockRelease(payload) {
    const reason = payload.view.state.values['lock-reason']['lock-reason-value'].value;
    await updateStatus({ repositoryName: 'pix', environment: 'production', authorizeDeployment: false, reason });
    const message = `⛔️La mise en production a été bloquée par <@${payload.user.id}>. Motif: ${reason}. Faire /mep/unlock pour débloquer, une fois la situation réglée`;
    slackPostMessageService.postMessage({
      message,
    });
    return {
      response_action: 'clear',
    };
  },
};

export default viewSubmissions;
