const logger = require('./services/logger');

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

module.exports = {
  handleErrors,
};
