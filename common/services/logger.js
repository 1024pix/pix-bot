let enabledFromConfiguration = true;

if (
  process.env.NODE_ENV === 'test' &&
  (process.env.TEST_LOG_ENABLED === undefined || process.env.TEST_LOG_ENABLED !== 'true')
) {
  enabledFromConfiguration = false;
}

function serialize({ event, message, job, stack, level, data }) {
  const log = {
    event,
    message: typeof message === 'object' ? JSON.stringify(message) : message,
    job,
    stack: typeof stack === 'object' ? JSON.stringify(stack) : stack,
    level,
    data,
  };

  return JSON.stringify(log);
}

const logger = {
  error: ({ event, message, job, stack, data }, injectedLogger = console, enabled = enabledFromConfiguration) => {
    if (enabled) {
      injectedLogger.error(serialize({ event, message, job, stack, data, level: 'error' }));
    }
  },

  info: ({ event, message, job, stack, data }, injectedLogger = console, enabled = enabledFromConfiguration) => {
    if (enabled) {
      injectedLogger.log(serialize({ event, message, job, stack, data, level: 'info' }));
    }
  },

  warn: ({ event, message, job, stack, data }, injectedLogger = console, enabled = enabledFromConfiguration) => {
    if (enabled) {
      injectedLogger.warn(serialize({ event, message, job, stack, data, level: 'warn' }));
    }
  },
};

export { logger };
