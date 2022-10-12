function handleErrors(request, h) {
  const response = request.response;

  if (response instanceof Error) {
    console.log(response.stack);
    return h.response('An error occurred, please try again later').code(500);
  }

  return h.continue;
}

module.exports = {
  handleErrors,
};
