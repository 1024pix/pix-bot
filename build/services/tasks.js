import { config } from '../../config.js';
import { deployReviewApps } from './deploy-review-apps.js';

export default [
  {
    name: 'Deploy Review Apps',
    enabled: true,
    schedule: config.scalingo.reviewApps.deploySchedule,
    handler: async () => {
      await deployReviewApps();
    },
  },
];
