import slackPostMessageService from './slack/surfaces/messages/post-message.js';
import { config } from '../../config.js';
import * as applicationsDeployment from '../repositories/applications-deployment.repository.js';

async function addNewVersion({ version, environment }) {
  if (await _checkIfVersionExists({ version, environment })) {
    return;
  }
  await applicationsDeployment.createVersion({ version, environment });
}

async function markAppHasDeployed({ app, version, environment }) {
  await applicationsDeployment.markHasDeployed({ version, environment, app });
  if (await _checkIfAllApplicationsHasDeployed({ environment, version })) {
    await slackPostMessageService.postMessage({
      message: `Bonjour 👋 la mise en ${environment} de toute les applications  a bien été effectuée!`,
      channel: config.slack.releaseChannelId,
      token: config.slack.releaseBotToken,
    });
  }
}

function isPixApplication(applicationName) {
  return config.PIX_APPS.includes(applicationName);
}

export { addNewVersion, markAppHasDeployed, isPixApplication };

async function _checkIfVersionExists({ version, environment }) {
  const apps = await applicationsDeployment.getByVersionAndEnvironment({ version, environment });
  return apps.length > 0;
}

async function _checkIfAllApplicationsHasDeployed({ version, environment }) {
  const applications = await applicationsDeployment.getByVersionAndEnvironment({ version, environment });
  let allIsDeployed = true;
  applications.map((application) => {
    if (!application.isDeployed) {
      allIsDeployed = false;
    }
  });
  return allIsDeployed;
}
