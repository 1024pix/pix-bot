const { verifySignatureAndParseBody: verifySlackSignatureAndParseBody } = require('./services/slack/security');
const { verifyWebhookSignature: verifyGithubSignature } = require('./services/github');

const slackConfig = {
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

export default slackConfig;
