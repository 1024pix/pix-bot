const openModalReleaseDeploymentConfirmation = require('./surfaces/modals/deploy-release/release-deployment-confirmation');
const openModalApplicationCreationConfirmation = require('./surfaces/modals/scalingo-apps/application-creation-confirmation');
const { environments, deploy } = require('../../../common/services/releases');
const githubService = require('../../../common/services/github');
const slackPostMessageService = require('../../../common/services/slack/surfaces/messages/post-message');
const slackGetUserInfos = require('../../../common/services/slack/surfaces/user-infos/get-user-infos');
const ScalingoClient = require('../../../common/services/scalingo-client');
const { ScalingoAppName } = require('../../../common/models/ScalingoAppName');

module.exports = {
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
    if (!ScalingoAppName.isApplicationNameValid(applicationName)) {
      return `${applicationName} is incorrect`;
    }
    return openModalApplicationCreationConfirmation(
      applicationName,
      applicationEnvironment,
      applicationEnvironmentName,
      userEmail
    );
  },

  submitReleaseTagSelectionCallbackId: openModalReleaseDeploymentConfirmation.callbackId,

  submitApplicationNameSelectionCallbackId: openModalApplicationCreationConfirmation.callbackId,

  submitReleaseDeploymentConfirmation(payload) {
    const releaseTag = payload.view.private_metadata;
    if (!githubService.isBuildStatusOK({ tagName: releaseTag.trim().toLowerCase() })) {
      slackPostMessageService.postMessage('MEP bloquée. Etat de l‘environnement de recette à vérifier.');
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
    slackPostMessageService.postMessage(message, null, channel);
    return {
      response_action: 'clear',
    };
  },
};
