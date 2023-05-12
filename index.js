require('dotenv').config();

const config = require('./config');
const server = require('./server');
const { createCronJob } = require('./common/services/cron-job');
const githubServices = require('./common/services/github');
const { deploy } = require('./run/services/deploy');
const ecoModeService = require('./build/services/eco-mode-service');

const init = async () => {
  await ecoModeService.start();

  createCronJob(
    'Deploy Pix site',
    async () => {
      const repoName = config.PIX_SITE_REPO_NAME;
      const releaseTag = await githubServices.getLatestReleaseTag(repoName);
      deploy(repoName, config.PIX_SITE_APPS, releaseTag);
    },
    config.pixSiteDeploy.schedule
  );

  await server.start();
  console.log('Server running on %s', server.info.uri);
};

init();
