const Job = require('./Job');
const reviewAppManager = require('../review-app-manager');

const name = 'stop-active-review-apps';

const cronTime = process.env.JOB_STOP_REVIEW_APPS || '0 0 19 * * 1-5';

async function onTick() {
  return await reviewAppManager.stopActiveReviewApps();
}

module.exports = new Job(name, cronTime, onTick);
