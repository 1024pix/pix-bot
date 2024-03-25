import axios from 'axios';

import config from '../../../../../config.js';
import * as logger from '../../../logger.js';

const getUserInfos = {
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
      logger.error({ event: 'post-message', message: response.data });
      throw new Error('Slack error received');
    }
    return response.data.user.profile.email;
  },
};

export default getUserInfos;
