import { logger } from './services/logger.js';

function handleErrors(request, h) {
  if (request.response.isBoom) {
    logger.info({
      event: 'response-handler',
      message: request.response.message,
      stack: request.response.stack,
    });
  }
  return h.continue;
}

export { handleErrors };
