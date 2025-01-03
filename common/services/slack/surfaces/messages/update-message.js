import { config } from '../../../../../config.js';
import { httpAgent } from '../../../../http-agent.js';
import { logger } from '../../../logger.js';

async function updateMessage({ message, ts, attachments, channel = '#tech-releases', injectedHttpAgent = httpAgent }) {
  const url = 'https://slack.com/api/chat.update';

  const headers = {
    'content-type': 'application/json',
    authorization: `Bearer ${config.slack.botToken}`,
  };
  const payload = {
    channel,
    ts,
    as_user: true,
    text: message,
    attachments: attachments,
  };

  const slackResponse = await injectedHttpAgent.post({ url, payload, headers });
  if (slackResponse.isSuccessful) {
    if (!slackResponse.data.ok) {
      logger.error({
        event: 'slack-update-message',
        message: `Slack error occurred while sending message : ${slackResponse.data.error}`,
        stack: `Payload for error was ${JSON.stringify(payload)}`,
      });
    }
  }
}

export default { updateMessage };
