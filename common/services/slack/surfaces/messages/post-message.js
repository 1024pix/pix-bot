import config from '../../../../../config.js';
import { httpAgent } from '../../../../http-agent.js';
import * as logger from '../../../logger.js';

const postMessage = {
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

    const slackResponse = await injectedHttpAgent.post({ url, payload, headers });
    if (slackResponse.isSuccessful) {
      if (!slackResponse.data.ok) {
        logger.error({
          event: 'slack-post-message',
          message: `Slack error occured while sending message : ${slackResponse.data.error}`,
          stack: `Payload for error was ${JSON.stringify(payload)}`,
        });
      }
    }
  },
};

export default postMessage;
