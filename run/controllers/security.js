import Boom from '@hapi/boom';

import { config } from '../../config.js';
import * as cdnServices from '../services/cdn.js';
import { logger } from '../../common/services/logger.js';
import slackPostMessageService from '../../common/services/slack/surfaces/messages/post-message.js';
import { Actions, Attachment, Button, Context, Divider, Message, Section } from 'slack-block-builder';

const _buildSlackMessage = function ({ ip, ja3 }) {
  return {
    channel: `#${config.slack.blockedAccessesChannel}`,
    message: 'Règle de blocage mise en place sur Baleen.',
    attachments: Message()
      .attachments(
        Attachment({ color: '#106c1f' })
          .blocks(
            Section().fields(`IP`, `${ip}`),
            Section().fields(`JA3`, `${ja3}`),
            Context().elements(`At ${new Date().toLocaleString()}`),
            Divider(),
            Actions().elements(Button().text('Désactiver').actionId('disable-automatic-rule').danger()),
          )
          .fallback('Règle de blocage mise en place sur Baleen.'),
      )
      .buildToObject().attachments,
  };
};

const securities = {
  async blockAccessOnBaleen(request) {
    if (request.headers.authorization !== config.datadog.token) {
      return Boom.unauthorized('Token is missing or is incorrect');
    }

    const { monitorId, body } = request.payload;

    if (!body) {
      const message = `Inconsistent payload : ${JSON.stringify(request.payload)}.`;
      logger.warn({
        event: 'block-access-on-baleen',
        message,
      });
      return Boom.badRequest(message);
    }

    if (!body.match(/>>(.*)<</)) {
      const message = `Inconsistent payload : ${body}.`;
      logger.warn({ event: 'block-access-on-baleen', message });
      return Boom.badRequest(message);
    }

    const { ip, ja3 } = JSON.parse(body.match(/>>(.*)<</)[1]);

    if (!ip || ip === '') {
      const message = 'IP is mandatory.';
      logger.warn({ event: 'block-access-on-baleen', message });
      return Boom.badRequest(message);
    }

    if (!ja3 || ja3 === '') {
      const message = 'JA3 is mandatory.';
      logger.warn({ event: 'block-access-on-baleen', message: message });
      return Boom.badRequest(message);
    }

    try {
      const result = await cdnServices.blockAccess({ ip, ja3, monitorId });
      await slackPostMessageService.postMessage(_buildSlackMessage({ ip, ja3 }));
      return result;
    } catch (error) {
      if (error instanceof cdnServices.NamespaceNotFoundError) {
        return Boom.badRequest();
      }
      return error;
    }
  },
};

export default securities;
