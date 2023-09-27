import appConfig from './config';
import {
  createLogger,
  format as winston_format,
  transports as winston_transports,
} from 'winston';
import LokiTransport from 'winston-loki';
import { formatDate } from './util/date';

export const configureLogging = () => {
  const loggerTransports: (winston_transports.ConsoleTransportInstance | LokiTransport)[] = [
    new winston_transports.Console(),
  ];
  const lokiHost = process.env.LOGS_COLLECTOR_HOST || '';
  const hasLoki = URL.canParse(lokiHost);
  if (hasLoki) {
    loggerTransports.push(new LokiTransport({
      host: lokiHost,
      json: true,
      labels: { app: 'cludus-gateway-nodejs' },
      onConnectionError: (err) => {
        console.error('LokiTransport error:', err);
      },
    }));
  }
  const logger = createLogger({
    level: appConfig.liveMode ? 'info' : 'debug',
    format: winston_format.combine(
      winston_format.colorize(),
      winston_format.splat(),
      winston_format.timestamp(),
      winston_format.printf(({ timestamp, level, message }) => {
        const datetime = formatDate(new Date(timestamp));
        return `[${datetime}] ${level}: ${message}`;
      })
    ),
    transports: loggerTransports,
  });
  ['debug', 'info', 'warn', 'error'].forEach((level) => {
    (console as any)[level] = (...args: any[]) => {
      if (!!args) {
        (logger as any)[level].apply(logger, args);
      }
    };
  });
  if (hasLoki) {
    console.debug('Collecting logs to %s with loki', lokiHost);
  }
};
