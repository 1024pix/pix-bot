import * as dotenv from 'dotenv';
dotenv.config();

import ecoModeService from './build/services/eco-mode-service.js';
import { createCronJob } from './common/services/cron-job.js';
import github from './common/services/github.js';
import * as logger from './common/services/logger.js';
import config from './config.js';
import { deploy } from './run/services/deploy.js';
import { taskScheluder } from './run/services/task-scheduler.js';
import tasks from './run/services/tasks.js';
import server from './server.js';

const init = async () => {
  await ecoModeService.start();

  createCronJob(
    'Deploy Pix site',
    async () => {
      const repoName = config.PIX_SITE_REPO_NAME;
      const releaseTag = await github.getLatestReleaseTag(repoName);
      deploy(repoName, config.PIX_SITE_APPS, releaseTag);
    },
    config.pixSiteDeploy.schedule,
  );

  taskScheluder(tasks);

  await server.start();

  logger.info({
    event: 'main',
    message: `Server running on "${server.info.uri}"`,
  });
};

init();
