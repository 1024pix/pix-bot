import ReviewAppManager from '@1024pix/scalingo-review-app-manager';
ReviewAppManager.ReviewAppManager;

import { logger } from '../../common/services/logger.js';
import config from '../../config.js';

const ecoModeService = {
  async start() {
    const scalingoToken = config.scalingo.reviewApps.token;
    const scalingoApiUrl = config.scalingo.reviewApps.apiUrl;
    const stopCronTime = config.ecoMode.stopSchedule;
    const startCronTime = config.ecoMode.startSchedule;
    const timeZone = process.env.TIME_ZONE || 'Europe/Paris';
    const ignoredReviewApps = process.env.IGNORED_REVIEW_APPS ? process.env.IGNORED_REVIEW_APPS.split(',') : [];

    if (!stopCronTime || !startCronTime) {
      logger.info({
        event: 'eco-mode-service',
        message: 'No schedule configured for eco mode - skipping.',
      });
      return;
    }
    const reviewAppManager = new ReviewAppManager(scalingoToken, scalingoApiUrl, {
      stopCronTime,
      restartCronTime: startCronTime,
      timeZone,
      ignoredReviewApps,
    });
    await reviewAppManager.startEcoMode();
  },
};

export default ecoModeService;
