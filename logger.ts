import pino from 'pino';

export default pino({
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      singleLine: true,
      sync: true
    }
  },
  level: process.env.PINO_LOG_LEVEL || 'info'
});
