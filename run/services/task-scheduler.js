const parisTimezone = 'Europe/Paris';
const CronJob = require('cron').CronJob;
const logger = require('../../common/services/logger');

const taskScheluder = function (tasksList) {
  const scheduleTask = ({ schedule, handler }) => {
    new CronJob({
      cronTime: schedule,
      onTick: handler,
      onComplete: null,
      start: true,
      timezone: parisTimezone,
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

module.exports = taskScheluder;
