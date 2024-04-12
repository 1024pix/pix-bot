import * as CronJob from 'cron';

import { logger } from '../../common/services/logger.js';

const parisTimezone = 'Europe/Paris';

const taskScheluder = function (tasksList) {
  const scheduleTask = ({ schedule, handler }) => {
    new CronJob({
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

export { taskScheluder };
