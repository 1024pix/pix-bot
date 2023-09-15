const config = require('../../../../../config');
const { httpAgent } = require('../../../../http-agent');

module.exports = {
  async postMessage({ message, attachments, channel = '#tech-releases', injectedHttpAgent = httpAgent }) {
    const url = 'https://slack.com/api/chat.postMessage';

    const headers = {
      'content-type': 'application/json',
      authorization: `Bearer ${config.slack.botToken}`,
    };
    const payload = {
      channel: channel,
      text: message,
      attachments: attachments,
    };

    await injectedHttpAgent.post({ url, payload, headers });
  },
};
