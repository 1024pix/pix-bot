import { githubConfig } from '../../common/config';
import * as githubController from '../../build/controllers/github';

const github = [
  {
    method: 'POST',
    path: '/github/webhook',
    handler: githubController.processWebhook,
    config: githubConfig,
  },
];

export { github };
