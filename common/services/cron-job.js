const CronJob = require('cron').CronJob;
const parisTimezone = 'Europe/Paris';

function createCronJob(jobName, jobFunction, jobSchedule) {
  if (!jobSchedule) {
    console.log(`No schedule configured for cron job ${jobName} - skipping.`);
    return;
  }
  try {
    new CronJob(jobSchedule, jobFunction, null, true, parisTimezone);
  } catch (e) {
    console.error(e);
  }
  console.log(`Started job ${jobName} with cron time "${jobSchedule}"`);
}

module.exports = {
  createCronJob,
};
