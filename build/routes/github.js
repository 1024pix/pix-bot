import { processWebhook } from '../../build/controllers/github.js';
import { commonConfig } from '../../common/config.js';

const github = [
  {
    method: 'POST',
    path: '/github/webhook',
    handler: processWebhook,
    config: commonConfig.githubConfig,
  },
];

export default github;
