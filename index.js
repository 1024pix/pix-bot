import * as dotenv from 'dotenv';
dotenv.config();

import ecoModeService from './build/services/eco-mode-service.js';
import { logger } from './common/services/logger.js';
import { taskScheduler } from './run/services/task-scheduler.js';
import runTasks from './run/services/tasks.js';
import server from './server.js';

const init = async () => {
  await ecoModeService.start();

  taskScheduler(runTasks);

  await server.start();

  logger.info({
    event: 'main',
    message: `Server running on "${server.info.uri}"`,
  });
};

init();
