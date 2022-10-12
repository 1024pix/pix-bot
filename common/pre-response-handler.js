const { scalingo } = require('../config');

function handleErrors(request, h) {
  const response = request.response;

  if (response instanceof Error && response.output.statusCode !== 401 && response.output.statusCode !== 400) {
    const stacktrace = response.stack.slice(0, scalingo.maxLogLength);
    console.error(stacktrace);
    return h.response('An error occurred, please try again later').code(500);
  }

  return h.continue;
}

module.exports = {
  handleErrors,
};
