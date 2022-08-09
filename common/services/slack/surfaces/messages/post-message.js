const axios = require('axios');
const config = require('../../../../../config');

module.exports = {
  async postMessage(message, attachments) {
    const options = {
      method: 'POST',
      url: 'https://slack.com/api/chat.postMessage',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${config.slack.botToken}`,
      },
      data: {
        channel: '#tech-releases',
        text: message,
        attachments: attachments,
      },
    };

    const response = await axios(options);
    if (!response.data.ok) {
      console.error(response.data);
      throw new Error('Slack error received');
    }

    return response;
  },
};
