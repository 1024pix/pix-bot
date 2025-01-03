import Boom from '@hapi/boom';

import { config } from '../../config.js';
import * as cdnServices from '../services/cdn.js';
import { logger } from '../../common/services/logger.js';
import slackPostMessageService from '../../common/services/slack/surfaces/messages/post-message.js';
import { AutomaticRule } from '../models/AutomaticRule.js';

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
      const addedRules = await cdnServices.blockAccess({ ip, ja3, monitorId });
      const automaticRule = new AutomaticRule({ ip, ja3 });
      await slackPostMessageService.postMessage(automaticRule.getInitialMessage({ addedRules }));
      return `Règles de blocage mises en place.`;
    } catch (error) {
      if (error instanceof cdnServices.NamespaceNotFoundError) {
        return Boom.badRequest();
      }
      return error;
    }
  },
};

export default securities;
