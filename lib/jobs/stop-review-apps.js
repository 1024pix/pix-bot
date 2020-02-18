const CronJob = require('cron').CronJob;
const Job = require('./job');
const getScalingoClient = require('../scalingo-client').getClient;

const cron = new CronJob(process.env.JOB_STOP_REVIEW_APPS, async () => {

  const scalingoClient = await getScalingoClient();

  const apps = await scalingoClient.Apps.all();

  const reviewApps = apps.filter((app) => app.name.includes('-review-pr'));

  return Promise.all(reviewApps.map(async (reviewApp) => {
    console.log(`Stopping ${reviewApp.name}…`);
    try {
      await client.Containers.scale(reviewApp.name, [{
        name: 'web',
        size: 'S',
        amount: 0,
      }]);
      console.log(`App ${reviewApp.name} stopped`);
    } catch(err) {
      if (err._data && err._data.error === 'no change in containers formation') {
        console.log(`App ${reviewApp.name} is already stopped`);
      } else {
        console.error(err);
      }
    }
  }));

}, null, true, 'Europe/Paris');

module.exports = new Job('stop-review-apps', cron);
