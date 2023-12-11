import pino from 'pino';

export default pino({
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      singleLine: true,
      sync: true,
      ignore: 'pid,req.remoteAddress,req.remotePort,req.id,req.headers.host,responseTime,res.headers.etag'
    }
  },
  level: process.env.PINO_LOG_LEVEL || 'info'
});
