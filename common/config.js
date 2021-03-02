const { verifySignatureAndParseBody } = require('./services/slack/security');

module.exports = {
  slackConfig: {
    payload: {
      allow: ['application/json', 'application/x-www-form-urlencoded'],
      parse: false
    },
    pre: [
      {method: verifySignatureAndParseBody, assign: 'payload'}
    ]
  },
};
