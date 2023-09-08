function serialize({ event, message, job, stack, level }) {
  const log = {
    event,
    message: typeof message === 'object' ? JSON.stringify(message) : message,
    job,
    stack: typeof stack === 'object' ? JSON.stringify(stack) : stack,
    level,
  };

  return JSON.stringify(log);
}

const error = ({ event, message, job, stack }, injectedLogger = console) => {
  injectedLogger.error(serialize({ event, message, job, stack, level: 'error' }));
};

const info = ({ event, message, job, stack }, injectedLogger = console) => {
  injectedLogger.log(serialize({ event, message, job, stack, level: 'info' }));
};

const warn = ({ event, message, job, stack }, injectedLogger = console) => {
  injectedLogger.warn(serialize({ event, message, job, stack, level: 'warn' }));
};
const ok = ({ event, message, job, stack }, injectedLogger = console) => {
  injectedLogger.ok(serialize({ event, message, job, stack, level: 'ok' }));
};

module.exports = {
  error,
  info,
  warn,
  ok,
};
