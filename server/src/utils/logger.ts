export interface LogMetadata {
  method?: string;
  route?: string;
  status?: number;
  durationMs?: number;
  errorCode?: string;
  userId?: string;
  [key: string]: unknown;
}

const sanitize = (data: unknown): unknown => {
  if (!data || typeof data !== 'object') return data;
  const clone: Record<string, unknown> = { ...(data as Record<string, unknown>) };
  const sensitiveKeys = ['jwt', 'token', 'authorization', 'otp', 'password', 'secret', 'apikey', 'api_key'];
  for (const key of Object.keys(clone)) {
    if (sensitiveKeys.some((s) => key.toLowerCase().includes(s))) {
      clone[key] = '[REDACTED]';
    } else if (typeof clone[key] === 'object') {
      clone[key] = sanitize(clone[key]);
    }
  }
  return clone;
};

export const logger = {
  info: (message: string, meta?: LogMetadata) => {
    const payload = {
      level: 'INFO',
      timestamp: new Date().toISOString(),
      message,
      ...(meta ? (sanitize(meta) as Record<string, unknown>) : {})
    };
    console.log(JSON.stringify(payload));
  },
  warn: (message: string, meta?: LogMetadata) => {
    const payload = {
      level: 'WARN',
      timestamp: new Date().toISOString(),
      message,
      ...(meta ? (sanitize(meta) as Record<string, unknown>) : {})
    };
    console.warn(JSON.stringify(payload));
  },
  error: (message: string, error?: unknown, meta?: LogMetadata) => {
    const errObj =
      error instanceof Error
        ? { errorMessage: error.message, errorName: error.name }
        : { errorMessage: String(error) };

    const payload = {
      level: 'ERROR',
      timestamp: new Date().toISOString(),
      message,
      ...errObj,
      ...(meta ? (sanitize(meta) as Record<string, unknown>) : {})
    };
    console.error(JSON.stringify(payload));
  }
};
