const Job = require('./Job');
const reviewAppManager = require('../review-app-manager');

const name = 'restart-managed-review-apps';

const cronTime = process.env.JOB_START_REVIEW_APPS || '0 0 8 * * 1-5';

async function onTick() {
  return await reviewAppManager.restartManagedReviewApps();
}

module.exports = new Job(name, cronTime, onTick);
