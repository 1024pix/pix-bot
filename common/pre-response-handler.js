const { scalingo } = require('../config');

function handleErrors(request, h) {
  const response = request.response;
  const expectedStatusCodes = [404, 401, 400];
  if (response instanceof Error) {
    const statusCode = response?.output?.statusCode;
    if (!expectedStatusCodes.includes(statusCode)) {
      {
        const message = response.stack.slice(0, scalingo.maxLogLength);
        console.error(message);
        return h.response('An error occurred, please try again later').code(500);
      }
    }
  }

  return h.continue;
}

module.exports = {
  handleErrors,
};
