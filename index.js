import * as dotenv from 'dotenv';
dotenv.config();

import config from './config';
import server from './server';
import { createCronJob } from './common/services/cron-job';
import github from './common/services/github';
import { deploy } from './run/services/deploy';
import ecoModeService from './build/services/eco-mode-service';
import * as logger from './common/services/logger';
import * as taskScheluder from './run/services/task-scheduler';
import tasks from './run/services/tasks.js';

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
