import * as openModalReleaseDeploymentConfirmation from './surfaces/modals/deploy-release/release-deployment-confirmation.js';
import * as openModalApplicationCreationConfirmation from './surfaces/modals/scalingo-apps/application-creation-confirmation.js';
import releases from '../../../common/services/releases.js';
import github from '../../../common/services/github.js';
import slackPostMessageService from '../../../common/services/slack/surfaces/messages/post-message.js';
import slackGetUserInfos from '../../../common/services/slack/surfaces/user-infos/get-user-infos.js';
import ScalingoClient from '../../../common/services/scalingo-client.js';
import { ScalingoAppName } from '../../../common/models/ScalingoAppName.js';
import config from '../../../config.js';
import {applicationCreationConfirmation} from './surfaces/modals/scalingo-apps/application-creation-confirmation.js';

const viewSubmissions = {
  async submitReleaseTagSelection(payload) {
    const releaseTag = payload.view.state.values['deploy-release-tag']['release-tag-value'].value;
    const hasConfigFileChanged = await github.hasConfigFileChangedInLatestRelease();
    return openModalReleaseDeploymentConfirmation.releaseDeploymentConfirmation(releaseTag, hasConfigFileChanged);
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
    return openModalApplicationCreationConfirmation.applicationCreationConfirmation(
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
    if (!github.isBuildStatusOK({ tagName: releaseTag.trim().toLowerCase() })) {
      const message = 'MEP bloquée. Etat de l‘environnement de recette à vérifier.';
      slackPostMessageService.postMessage({ message });
    } else {
      releases.deploy(releases.environments.production, releaseTag);
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

export default viewSubmissions;
