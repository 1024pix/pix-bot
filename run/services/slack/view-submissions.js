const openModalReleaseDeploymentConfirmation = require('./surfaces/modals/deploy-release/release-deployment-confirmation');
const openModalApplicationCreationConfirmation = require('./surfaces/modals/scalingo-apps/application-creation-confirmation');
const { environments, deploy } = require('../../../common/services/releases');
const githubService = require('../../../common/services/github');
const slackPostMessageService = require('../../../common/services/slack/surfaces/messages/post-message');
const slackGetUserInfos = require('../../../common/services/slack/surfaces/user-infos/get-user-infos');
const ScalingoClient = require('../../../common/services/scalingo-client');
const { ScalingoAppName } = require('../../../common/models/ScalingoAppName');
const config = require('../../../config');
const { getPixApiVersion } = require('../../../common/services/pix-api');
const settings = require('../../../config');

const CONFIG_FILE_PATH = 'api/src/shared/config.js';

async function getFilesAndCommitsBetweenCurrentApiVersionAndReleaseTag({
  repoOwner = config.github.owner,
  repoName = config.github.repository,
  pixApiVersion,
  releaseTag,
}) {
  const versionsToCompare = `v${pixApiVersion}...${releaseTag}`;
  const endpoint = `https://api.github.com/repos/${repoOwner}/${repoName}/compare/${versionsToCompare}`;

  return await githubService.getFilesAndCommitsModifiedBetweenTwoReleases(endpoint);
}

function hasConfigBeenModified(files) {
  const result = files.filter((f) => f.filename === CONFIG_FILE_PATH);

  return result.length > 0;
}

function filterAndMapCommitsWithConfigFile(commits) {
  return commits
    .filter((commit) => {
      const files = commit.data.files.filter((file) => file.filename === CONFIG_FILE_PATH);
      return files.length > 0;
    })
    .map((commit) => commit.data.sha);
}

module.exports = {
  async submitReleaseTagSelection(payload) {
    const releaseTag = payload.view.state.values['deploy-release-tag']['release-tag-value'].value;
    const repoOwner = settings.github.owner;
    const repoName = settings.github.repository;

    // TODO catch exception ?
    const pixApiVersion = await getPixApiVersion();
    const { files, commits } = await getFilesAndCommitsBetweenCurrentApiVersionAndReleaseTag({
      pixApiVersion,
      releaseTag,
    });
    const hasConfigFileChanged = hasConfigBeenModified(files);

    if (hasConfigFileChanged) {
      const flatCommits = commits.map((commit) => commit.sha);
      const allCommits = await githubService.getCommitsDetails({
        repoOwner,
        repoName,
        commits: flatCommits,
      });
      const commitsShaList = filterAndMapCommitsWithConfigFile(allCommits);

      const pullRequestsForCommitShaDetails = await githubService.getPullRequestsDetailsByCommitShas({
        repoOwner,
        repoName,
        commitsShaList,
      });
      let pRsAndTeamLabelsMessageList = 'Les Pr et équipes concernées sont : ';

      pullRequestsForCommitShaDetails.forEach((pullRequestDetails) => {
        pRsAndTeamLabelsMessageList = pRsAndTeamLabelsMessageList.concat(
          `<${pullRequestDetails.html_url}|${pullRequestDetails.labels}> `,
        );
      });

      const message =
        ':warning: Il y a eu des ajout(s)/suppression(s) ' +
        `<https://github.com/1024pix/pix/compare/v${pixApiVersion}...${releaseTag}|dans le fichier config.js>. ` +
        "Pensez à vérifier que toutes les variables d'environnement sont bien à jour sur *Scalingo PRODUCTION*. " +
        `${pRsAndTeamLabelsMessageList}`;

      await slackPostMessageService.postMessage({
        message,
        channel: '#tech-releases',
      });
    }

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
      const message = "MEP bloquée. Etat de l'environnement de recette à vérifier.";
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
