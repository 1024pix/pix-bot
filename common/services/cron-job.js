const CronJob = require('cron').CronJob;
const parisTimezone = 'Europe/Paris';
const logger = require('./logger');

function createCronJob(jobName, jobFunction, jobSchedule) {
  if (!jobSchedule) {
    logger.warn({
      event: 'cron',
      message: `No schedule configured for cron job ${jobName} - skipping.`,
    });

    return;
  }
  try {
    new CronJob(
      jobSchedule,
      async () => {
        logger.info({
          event: 'cron',
          message: `Start job '${jobName}'`,
        });

        try {
          await jobFunction();
        } finally {
          logger.info({
            event: 'cron',
            message: `End job '${jobName}'`,
          });
        }
      },
      null,
      true,
      parisTimezone
    );
  } catch (e) {
    logger.error({
      event: 'cron',
      message: e,
    });
  }

  logger.info({
    event: 'cron',
    message: `Started job ${jobName} with cron time "${jobSchedule}"`,
  });
}

module.exports = {
  createCronJob,
};
