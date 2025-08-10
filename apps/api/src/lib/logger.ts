export function buildLoggerOptions(env: string) {
  const isDev = env !== 'production';
  return {
    level: isDev ? 'debug' : 'info',
    transport: isDev
      ? {
          target: 'pino-pretty',
          options: { colorize: true, translateTime: 'SYS:standard' },
        }
      : undefined,
  } as const;
}


