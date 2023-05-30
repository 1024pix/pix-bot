function createMessage({ event, message, job, stack }, level) {
  let obj = {};

  if (event) {
    obj.event = event;
  }

  if (message) {
    if (typeof message === 'object') {
      message = JSON.stringify(message);
    }

    obj.message = message;
  }

  if (job) {
    obj.job = job;
  }

  if (stack) {
    if (typeof stack === 'object') {
      stack = JSON.stringify(message);
    }

    obj.stack = stack;
  }

  obj.level = level;

  return JSON.stringify(obj);
}

const error = ({ event, message, job, stack }, injectedLogger = console) => {
  injectedLogger.error(createMessage({ event, message, job, stack }, 'error'));
};

const info = ({ event, message, job, stack }, injectedLogger = console) => {
  injectedLogger.log(createMessage({ event, message, job, stack }, 'info'));
};

const warn = ({ event, message, job, stack }, injectedLogger = console) => {
  injectedLogger.warn(createMessage({ event, message, job, stack }, 'warn'));
};

module.exports = {
  error,
  info,
  warn,
};
