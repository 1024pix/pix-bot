let enabledFromConfiguration = true;

if (
  process.env.NODE_ENV === 'test' &&
  (process.env.TEST_LOG_ENABLED !== undefined || process.env.TEST_LOG_ENABLED !== 'enabled')
) {
  enabledFromConfiguration = false;
}

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

const error = ({ event, message, job, stack }, injectedLogger = console, enabled = enabledFromConfiguration) => {
  if (enabled) {
    injectedLogger.error(serialize({ event, message, job, stack, level: 'error' }));
  }
};

const info = ({ event, message, job, stack }, injectedLogger = console, enabled = enabledFromConfiguration) => {
  if (enabled) {
    injectedLogger.log(serialize({ event, message, job, stack, level: 'info' }));
  }
};

const warn = ({ event, message, job, stack }, injectedLogger = console, enabled = enabledFromConfiguration) => {
  if (enabled) {
    injectedLogger.warn(serialize({ event, message, job, stack, level: 'warn' }));
  }
};
const ok = ({ event, message, job, stack }, injectedLogger = console, enabled = enabledFromConfiguration) => {
  if (enabled) {
    injectedLogger.ok(serialize({ event, message, job, stack, level: 'ok' }));
  }
};

module.exports = {
  error,
  info,
  warn,
  ok,
};
