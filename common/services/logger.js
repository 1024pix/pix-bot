const error = (message, injectedLogger = console) => {
  injectedLogger.error(JSON.stringify(message));
};

module.exports = {
  error,
};
