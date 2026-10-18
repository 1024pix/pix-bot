import { ReviewAppManager as ScalingoReviewAppManager } from '@1024pix/scalingo-review-app-manager';

import { logger } from '../../common/services/logger.js';
import { config } from '../../config.js';

const ecoModeService = {
  async start({ ReviewAppManager = ScalingoReviewAppManager } = {}) {
    const stopCronTime = config.ecoMode.stopSchedule;
    const startCronTime = config.ecoMode.startSchedule;
    const timeZone = process.env.TIME_ZONE || 'Europe/Paris';
    const ignoredReviewApps = config.ecoMode.ignoredReviewApps ? config.ecoMode.ignoredReviewApps.split(',') : [];
    const pollMaxAttempts = config.ecoMode.pollMaxAttempts;
    const pollTimeInterval = config.ecoMode.pollTimeInterval;

    if (!stopCronTime || !startCronTime) {
      logger.info({
        event: 'eco-mode-service',
        message: 'No schedule configured for eco mode - skipping.',
      });
      return;
    }
    const options = {
      stopCronTime,
      restartCronTime: startCronTime,
      timeZone,
      ignoredReviewApps,
      pollMaxAttempts,
      pollTimeInterval,
    };
    for (const [region, { token, apiUrl }] of Object.entries(config.scalingo.reviewApps)) {
      if (!token) {
        logger.warn({
          event: 'eco-mode-service',
          message: `No Scalingo token configured for review apps region ${region} - skipping.`,
        });
        continue;
      }
      const reviewAppManager = new ReviewAppManager(token, apiUrl, options);
      reviewAppManager.startEcoMode();
    }
  },
};

export default ecoModeService;
