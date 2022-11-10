function handleErrors(request, h) {
  if (request.response.isBoom) {
    console.error({ level: 'ERROR', message: request.response.message, stack: request.response.stack });
  }
  return h.continue;
}

module.exports = {
  handleErrors,
};
