const error = (message, injectedLogger = console) => {
  injectedLogger.error(JSON.stringify(message));
};

const info = (message, injectedLogger = console) => {
  injectedLogger.log(JSON.stringify(message));
};

const warn = (message, injectedLogger = console) => {
  injectedLogger.warn(JSON.stringify(message));
};

module.exports = {
  error,
  info,
  warn,
};
