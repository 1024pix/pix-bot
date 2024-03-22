import * as CronJob from 'cron';
import * as logger from './logger.js';

const parisTimezone = 'Europe/Paris';

function createCronJob(jobName, jobFunction, jobSchedule) {
  if (!jobSchedule) {
    logger.info({
      event: 'cron',
      message: `No schedule configured for cron job ${jobName} - skipping.`,
      job: jobName,
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
      parisTimezone,
    );
  } catch (e) {
    logger.info({
      event: 'cron',
      message: e,
      job: jobName,
    });
  }
  logger.info({
    event: 'cron',
    message: `Started job ${jobName} with cron time "${jobSchedule}"`,
    job: jobName,
  });
}

export { createCronJob };
