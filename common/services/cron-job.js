const CronJob = require('cron').CronJob;
const parisTimezone = 'Europe/Paris';

function createCronJob(jobName, jobFunction, jobSchedule) {
  try {
    new CronJob(jobSchedule, jobFunction, null, true, parisTimezone);
  } catch (e) {
    console.error(e);
  }
  console.log(`Started job ${jobName} with cron time "${jobSchedule}"`);
}

module.exports = {
  createCronJob
};
