const CronJob = require('cron').CronJob;
const Job = require('./job');
const getScalingoClient = require('../scalingo-client').getClient;

const cron = new CronJob(process.env.JOB_START_REVIEW_APPS, async () => {

  const scalingoClient = await getScalingoClient();

  const apps = await scalingoClient.Apps.all();

  const reviewApps = apps.filter((app) => app.name.includes('-review-pr'));

  return Promise.all(reviewApps.map((reviewApp) => {
    return client.Containers.scale(reviewApp.name, [{
      name: 'web',
      size: 'S',
      amount: 1,
    }]);
  }));

}, null, true);

module.exports = new Job('start-review-apps', cron);
