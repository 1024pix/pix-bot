const ReviewAppManager = require('scalingo-review-app-manager').ReviewAppManager;
const config = require('../../config');

module.exports = {
  async start() {
    const scalingoToken = config.scalingo.reviewApps.token;
    const scalingoApiUrl = config.scalingo.reviewApps.apiUrl;
    const stopCronTime = process.env.REVIEW_APP_STOP_SCHEDULE;
    const restartCronTime = process.env.REVIEW_APP_START_SCHEDULE;
    const timeZone = process.env.TIME_ZONE || 'Europe/Paris';
    const ignoredReviewApps = process.env.IGNORED_REVIEW_APPS ? process.env.IGNORED_REVIEW_APPS.split(',') : [];

    if (!config.ecoMode.stopSchedule || !config.ecoMode.startSchedule) {
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
