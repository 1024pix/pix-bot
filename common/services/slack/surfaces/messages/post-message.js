const axios = require('axios');
const config = require('../../../../../config');

module.exports = (data) => {
  const options = {
    method: 'POST',
    url: 'https://slack.com/api/chat.postMessage',
    headers: {
      'content-type': 'application/json',
      'authorization': `Bearer ${config.slack.botToken}`
    },
    data: {
      'channel': '#tech-releases',
      ...data
    }
  };
  return axios(options);
};
