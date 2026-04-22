import pino from 'pino';

let clientLogger: pino.Logger | null = null;
let serverLogger: pino.Logger | null = null;

function getClientLogger(): pino.Logger {
  if (clientLogger) return clientLogger;
  clientLogger = pino({
    level: process.env.NODE_ENV === 'development' ? 'debug' : 'warn',
    browser: { asObject: true },
    base: { env: process.env.NODE_ENV, source: 'browser' },
  });
  return clientLogger;
}

function getServerLogger(): pino.Logger {
  if (serverLogger) return serverLogger;
  const isDev = process.env.NODE_ENV === 'development';
  serverLogger = pino({
    level: isDev ? 'debug' : 'info',
    ...(isDev
      ? {
          transport: {
            target: 'pino-pretty',
            options: {
              colorize: true,
            },
          },
        }
      : {}),
    base: { env: process.env.NODE_ENV, source: 'server' },
  });
  return serverLogger;
}

export function getLogger(component: string) {
  const isBrowser = typeof window !== 'undefined';
  const base = isBrowser ? getClientLogger() : getServerLogger();
  return base.child({ component });
}

export default getLogger;
