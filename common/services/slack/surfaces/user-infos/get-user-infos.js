const axios = require('axios');
const config = require('../../../../../config');

module.exports = {
  async getUserEmail(userId) {
    const options = {
      method: 'GET',
      url: `https://slack.com/api/users.info?user=${userId}`,
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${config.slack.botToken}`,
      },
    };
    const response = await axios(options);
    if (!response.data.ok) {
      console.error(response.data);
      throw new Error('Slack error received');
    }
    return response.data.user.profile.email;
  },
};
