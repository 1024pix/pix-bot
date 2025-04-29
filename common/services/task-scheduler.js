import { CronJob } from 'cron';

import { logger } from './logger.js';

const parisTimezone = 'Europe/Paris';

const taskScheduler = function (tasksList) {
  const scheduleTask = ({ schedule, handler }) => {
    CronJob.from({
      cronTime: schedule,
      onTick: handler,
      onComplete: null,
      start: true,
      timeZone: parisTimezone,
    });
  };

  tasksList.forEach(({ name, schedule, enabled, handler }) => {
    if (enabled) {
      logger.info({ event: 'task-scheduler', message: `task ${name} scheduled ${schedule}` });
      scheduleTask({
        schedule,
        handler,
      });
    } else {
      logger.info({ event: 'task-scheduler', message: `task ${name} not scheduled` });
    }
  });
};

export { taskScheduler };
