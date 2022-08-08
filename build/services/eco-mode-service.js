const ReviewAppManager = require('scalingo-review-app-manager').ReviewAppManager;
const config = require('../../config');

module.exports = {
  async start() {
    const scalingoToken = config.scalingo.reviewApps.token;
    const scalingoApiUrl = config.scalingo.reviewApps.apiUrl;
    const stopCronTime = process.env.STOP_CRON_TIME;
    const restartCronTime = process.env.RESTART_CRON_TIME;
    const timeZone = process.env.TIME_ZONE || 'Europe/Paris';
    const ignoredReviewApps = process.env.IGNORED_REVIEW_APPS ? process.env.IGNORED_REVIEW_APPS.split(',') : [];

    if (!stopCronTime || !restartCronTime) {
      console.log('No schedule configured for eco mode - skipping.');
      return;
    }
    const reviewAppManager = new ReviewAppManager(scalingoToken, scalingoApiUrl, {
      stopCronTime,
      restartCronTime,
      timeZone,
      ignoredReviewApps,
    });
    await reviewAppManager.startEcoMode();
  },
};
