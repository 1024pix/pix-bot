import * as openModalReleaseDeploymentConfirmation from './surfaces/modals/deploy-release/release-deployment-confirmation';
import * as openModalApplicationCreationConfirmation from './surfaces/modals/scalingo-apps/application-creation-confirmation';
import { environments, deploy } from '../../../common/services/releases';
import * as githubService from '../../../common/services/github';
import * as slackPostMessageService from '../../../common/services/slack/surfaces/messages/post-message';
import * as slackGetUserInfos from '../../../common/services/slack/surfaces/user-infos/get-user-infos';
import * as ScalingoClient from '../../../common/services/scalingo-client';
import { ScalingoAppName } from '../../../common/models/ScalingoAppName';
import * as config from '../../../config';

const viewSubmissions = {
  async submitReleaseTagSelection(payload) {
    const releaseTag = payload.view.state.values['deploy-release-tag']['release-tag-value'].value;
    const hasConfigFileChanged = await githubService.hasConfigFileChangedInLatestRelease();
    return openModalReleaseDeploymentConfirmation(releaseTag, hasConfigFileChanged);
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
    return openModalApplicationCreationConfirmation(
      applicationName,
      applicationEnvironment,
      applicationEnvironmentName,
      userEmail,
    );
  },

  submitReleaseTagSelectionCallbackId: openModalReleaseDeploymentConfirmation.callbackId,

  submitApplicationNameSelectionCallbackId: openModalApplicationCreationConfirmation.callbackId,

  submitReleaseDeploymentConfirmation(payload) {
    const releaseTag = payload.view.private_metadata;
    if (!githubService.isBuildStatusOK({ tagName: releaseTag.trim().toLowerCase() })) {
      const message = 'MEP bloquée. Etat de l‘environnement de recette à vérifier.';
      slackPostMessageService.postMessage({ message });
    } else {
      deploy(environments.production, releaseTag);
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
    const message = `app ${applicationName} created <${invitationLink}|invitation link>`;
    const channel = `@${payload.user.id}`;
    slackPostMessageService.postMessage({ message, channel });
    return {
      response_action: 'clear',
    };
  },
};

export { viewSubmissions };
