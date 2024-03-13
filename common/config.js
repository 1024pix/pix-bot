import { verifySignatureAndParseBody as verifySlackSignatureAndParseBody } from './services/slack/security';
import { verifyWebhookSignature as verifyGithubSignature } from './services/github';

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
    pre: [{ method: verifyGithubSignature }],
  },
};

export { commonConfig };
