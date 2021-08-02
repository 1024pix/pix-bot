const axios = require('axios');
const config = require('../../../../../config');

module.exports = (channel, ts, data) => {
  const options = {
    method: 'POST',
    url: 'https://slack.com/api/chat.update',
    headers: {
      'content-type': 'application/json',
      'authorization': `Bearer ${config.slack.botToken}`
    },
    data: {
      channel,
      ts,
      ...data
    }
  };
  return axios(options);
};
