import * as deployments from '../repositories/deployments.repository.js';
import postMessage from './slack/surfaces/messages/post-message.js';

async function run({ tag, appName }) {
  const app = appName.split('-').slice(0, -1).join('-');
  const isFromMonorepo = await deployments.isFromMonoRepo(app);
  const environment = appName.split('-').slice(-1)[0];
  if (!isFromMonorepo) return;
  await deployments.createTag(tag);
  await deployments.addDeployment({ tag, app });
  let allIsDeployed = false;
  const apps = await deployments.getAppStateByTag(tag);
  for (const app of apps) {
    if (!app) {
      allIsDeployed = false;
      break;
    }
  }
  if (allIsDeployed) {
    await postMessage({
      channel: config.slack.releaseChannelId,
      token: config.slack.releaseBotToken,
      message: `Le déploiement de la version ${tag} est terminé sur l'environnement de ${environment}`,
    });
  }
}

export { run };
