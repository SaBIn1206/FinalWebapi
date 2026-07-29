export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export interface LogContext {
  requestId?: string;
  method?: string;
  path?: string;
  statusCode?: number;
  durationMs?: number;
  userId?: string;
  error?: string;
  [key: string]: unknown;
}

const LOG_COLORS: Record<LogLevel, string> = {
  info: '\x1b[36m',
  warn: '\x1b[33m',
  error: '\x1b[31m',
  debug: '\x1b[90m',
};

const RESET_COLOR = '\x1b[0m';

function formatLog(level: LogLevel, message: string, context?: LogContext): void {
  const timestamp = new Date().toISOString();
  const color = LOG_COLORS[level];
  let logLine = `${color}[${timestamp}] [${level.toUpperCase()}]${RESET_COLOR} ${message}`;

  if (context) {
    const filtered = Object.fromEntries(
      Object.entries(context).filter(([_, v]) => v !== undefined && v !== null && v !== '')
    );
    logLine += ` ${JSON.stringify(filtered)}`;
  }

  switch (level) {
    case 'error':
      console.error(logLine);
      break;
    case 'warn':
      console.warn(logLine);
      break;
    case 'debug':
      console.debug(logLine);
      break;
    default:
      console.log(logLine);
  }
}

export const logger = {
  info: (message: string, context?: LogContext) => formatLog('info', message, context),
  warn: (message: string, context?: LogContext) => formatLog('warn', message, context),
  error: (message: string, context?: LogContext) => formatLog('error', message, context),
  debug: (message: string, context?: LogContext) => formatLog('debug', message, context),
};
