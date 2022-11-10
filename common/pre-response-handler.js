function handleErrors(request, h) {
  if (request.response.isBoom) {
    const errorLog = {
      level: 'ERROR',
      message: request.response.message,
      stack: request.response.stack,
    };
    console.error(JSON.stringify(errorLog));
  }
  return h.continue;
}

module.exports = {
  handleErrors,
};
