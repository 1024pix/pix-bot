import github from './services/github.js';
import { verifySignatureAndParseBody as verifySlackSignatureAndParseBody } from './services/slack/security.js';

const commonConfig = {
  slackConfig: {
    payload: {
      allow: ['application/json', 'application/x-www-form-urlencoded'],
      parse: false,
    },
    pre: [{ method: verifySlackSignatureAndParseBody, assign: 'payload' }],
  },

  githubConfig: {
    payload: {
      allow: ['application/json'],
    },
    pre: [{ method: github.verifyWebhookSignature }],
  },
};

export { commonConfig };
