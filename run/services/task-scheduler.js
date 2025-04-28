import { CronJob } from 'cron';

import { logger } from '../../common/services/logger.js';

const parisTimezone = 'Europe/Paris';

const taskScheduler = function (tasksList) {
  const scheduleTask = ({ schedule, handler, context }) => {
    CronJob.from({
      cronTime: schedule,
      onTick: handler,
      onComplete: null,
      start: true,
      timeZone: parisTimezone,
      context,
    });
  };

  tasksList.forEach(({ name, schedule, enabled, handler, context }) => {
    if (enabled) {
      logger.info({ event: 'task-scheduler', message: `task ${name} scheduled ${schedule}` });
      scheduleTask({
        schedule,
        handler,
        context,
      });
    } else {
      logger.info({ event: 'task-scheduler', message: `task ${name} not scheduled` });
    }
  });
};

export { taskScheduler };
