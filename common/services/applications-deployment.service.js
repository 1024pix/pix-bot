import slackPostMessageService from './slack/surfaces/messages/post-message.js';
import { config } from '../../config.js';
import * as applicationsDeployment from '../repositories/applications-deployment.repository.js';
import { finalize, getVersionList } from './jira.service.js';
import { logger } from './logger.js';

async function addNewVersion({ version, environment }) {
  if (await _checkIfVersionExists({ version, environment })) {
    return;
  }
  await applicationsDeployment.createVersion({ version, environment });
}

async function markAppHasDeployed({ app, version, environment }) {
  await applicationsDeployment.markHasDeployed({ version, environment, app });
  if (await _checkIfAllApplicationsHasDeployed({ environment, version })) {
    let message;

    switch (environment) {
      case 'production':
        message = `La mise en production de la ${version} a bien été effectuée :rocket: vous pouvez communiquer sur <#${config.slack.releaseComunicationChannelId}>. <!subteam^${config.slack.teamPoId}>`;
        await _handleJira(version);
        break;
      case 'recette':
        message = `La mise en recette de la ${version} a bien été effectuée, vous pouvez mettre vos messages en :thread: <!subteam^${config.slack.teamPoId}>`;
        break;
      default:
        message = `La mise en ${environment} de la ${version} a bien été effectuée.`;
        break;
    }
    await slackPostMessageService.postMessage({
      message,
      channel: config.slack.releaseChannelId,
      token: config.slack.releaseBotToken,
    });
  }
}

function isPixApplication({ applicationName, environment }) {
  return config.PIX_APPS.map((app) => `${app}-${environment}`).includes(applicationName);
}

export { addNewVersion, markAppHasDeployed, isPixApplication };

async function _checkIfVersionExists({ version, environment }) {
  const apps = await applicationsDeployment.getByVersionAndEnvironment({ version, environment });
  return apps.length > 0;
}

async function _checkIfAllApplicationsHasDeployed({ version, environment }) {
  const applications = await applicationsDeployment.getByVersionAndEnvironment({ version, environment });
  return applications.every((app) => app.isDeployed);
}

export async function _handleJira(version) {
  try {
    const versions = await getVersionList();
    const jiraVersion = versions.find((jiraVersion) => jiraVersion.name === version);
    if (jiraVersion) {
      await finalize(jiraVersion.id);
      return;
    }
  } catch (error) {
    logger.error({
      event: 'application deployment service',
      message: 'Error during jira interaction',
      job: 'release version on jira',
      stack: 'service',
      data: error,
    });
  }
}
