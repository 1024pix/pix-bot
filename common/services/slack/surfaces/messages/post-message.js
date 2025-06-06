import { config } from '../../../../../config.js';
import { httpAgent } from '../../../../http-agent.js';
import { logger } from '../../../logger.js';

async function postMessage({
  message,
  attachments,
  channel = '#tech-releases',
  injectedHttpAgent = httpAgent,
  token = config.slack.botToken,
}) {
  const url = 'https://slack.com/api/chat.postMessage';

  const headers = {
    'content-type': 'application/json',
    authorization: `Bearer ${token}`,
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
        message: `Slack error occurred while sending message : ${slackResponse.data.error}`,
        stack: `Payload for error was ${JSON.stringify(payload)}`,
      });
    }
  }
}

export default { postMessage };
