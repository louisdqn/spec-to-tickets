type LogLevel = "info" | "warn" | "error";

interface LogEntry {
  level: LogLevel;
  message: string;
  data?: Record<string, unknown>;
  timestamp: string;
}

function log(level: LogLevel, message: string, data?: Record<string, unknown>): void {
  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...(data && { data }),
  };

  switch (level) {
    case "error":
      console.error(JSON.stringify(entry));
      break;
    case "warn":
      console.warn(JSON.stringify(entry));
      break;
    default:
      console.log(JSON.stringify(entry));
  }
}

/**
 * Structured logger for server-side use.
 * Outputs JSON lines to stdout/stderr for easy parsing.
 */
export const logger = {
  /** Log informational messages (token usage, successful calls). */
  info: (message: string, data?: Record<string, unknown>) => log("info", message, data),
  /** Log warning messages (validation retries, near-limit usage). */
  warn: (message: string, data?: Record<string, unknown>) => log("warn", message, data),
  /** Log error messages (failed calls, unexpected exceptions). */
  error: (message: string, data?: Record<string, unknown>) => log("error", message, data),
};
