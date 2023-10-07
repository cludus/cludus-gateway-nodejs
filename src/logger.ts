import appConfig from './config';
import {
  createLogger,
  format as winston_format,
  transports,
} from 'winston';
import LokiTransport from 'winston-loki';
import { formatDate } from './util/date';
import { format } from 'node:util';

declare type LoggerTransports = transports.ConsoleTransportInstance | LokiTransport;

export const configureLogging = () => {
  const loggerTransports: LoggerTransports[] = [
    new transports.Console(),
  ];
  let collectorMessage = '';
  const collector = process.env.LOGS_COLLECTOR || '';
  if (collector) {
    collectorMessage = configCollector(collector, loggerTransports);
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
  console.debug = logger.debug.bind(logger);
  console.info = logger.info.bind(logger);
  console.warn = logger.warn.bind(logger);
  console.error = logger.error.bind(logger);
  if (collectorMessage) {
    console.debug(collectorMessage);
  }
};

const configCollector = (key: string, loggerTransports: LoggerTransports[]): string => {
  if (key === 'loki') {
    const lokiHost = process.env.LOGS_COLLECTOR_HOST || '';
    if (URL.canParse(lokiHost)) {
      loggerTransports.push(new LokiTransport({
        host: lokiHost,
        json: true,
        labels: { app: 'cludus-gateway', name: 'cludus-gateway-nodejs' },
        onConnectionError: (err) => {
          console.error('LokiTransport error:', err);
        },
      }));
      return format('Collecting logs to %s with loki', lokiHost);
    }
  }
  return '';
}
