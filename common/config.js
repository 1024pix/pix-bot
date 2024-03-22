import { verifySignatureAndParseBody as verifySlackSignatureAndParseBody } from './services/slack/security.js';
import github from './services/github.js';

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
    pre: [{ method: github.verifyGithubSignature }],
  },
};

export { commonConfig };
