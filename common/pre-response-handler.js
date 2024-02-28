// const logger = require('./services/logger');
import * as logger from "./services/logger.js";
export default function handleErrors(request, h) {
  if (request.response.isBoom) {
    logger.info({
      event: 'response-handler',
      message: request.response.message,
      stack: request.response.stack,
    });
  }
  return h.continue;
}
