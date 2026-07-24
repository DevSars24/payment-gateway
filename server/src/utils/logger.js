/**
 * Structured Enterprise Logger with severity levels and timestamp formatting.
 */
const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

const CURRENT_LEVEL = process.env.NODE_ENV === "production" ? LOG_LEVELS.INFO : LOG_LEVELS.DEBUG;

class Logger {
  formatMessage(level, message, context = {}) {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      level,
      message,
      correlationId: context.correlationId || "N/A",
      ...context,
    });
  }

  debug(message, context = {}) {
    if (CURRENT_LEVEL <= LOG_LEVELS.DEBUG) {
      console.log(`\x1b[36m[DEBUG]\x1b[0m ${this.formatMessage("DEBUG", message, context)}`);
    }
  }

  info(message, context = {}) {
    if (CURRENT_LEVEL <= LOG_LEVELS.INFO) {
      console.log(`\x1b[32m[INFO]\x1b[0m ${this.formatMessage("INFO", message, context)}`);
    }
  }

  warn(message, context = {}) {
    if (CURRENT_LEVEL <= LOG_LEVELS.WARN) {
      console.warn(`\x1b[33m[WARN]\x1b[0m ${this.formatMessage("WARN", message, context)}`);
    }
  }

  error(message, error = null, context = {}) {
    if (CURRENT_LEVEL <= LOG_LEVELS.ERROR) {
      const errorDetails = error
        ? {
            errorMessage: error.message,
            stack: error.stack,
            ...(error.details ? { details: error.details } : {}),
          }
        : {};

      console.error(`\x1b[31m[ERROR]\x1b[0m ${this.formatMessage("ERROR", message, { ...context, ...errorDetails })}`);
    }
  }
}

export const logger = new Logger();
