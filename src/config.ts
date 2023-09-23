import {
  createLogger,
  format as winston_format,
  transports as winston_transports,
} from 'winston';
import LokiTransport from 'winston-loki';

export interface AppConfig {
  serverPort: number;
  wsPath: string;
  metricsPath: string;
  liveMode: boolean;
  devMode: boolean;
  metricsConnectionsCountKey: string;
  metricsMessagesCountKey: string;
  metricsMessagesTimerKey: string;
  workerDelayInSeconds: number;
  maxUserHeartbeatDelayInSeconds: number;
}

const isLive = process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'live';
const appConfig: AppConfig = {
  serverPort: Number.parseInt(process.env.PORT || '') || 8080,
  wsPath: process.env.WS_PATH || '/websocket',
  metricsPath: process.env.METRICS_PATH || '/actuator/prometheus',
  liveMode: isLive,
  devMode: !isLive,
  metricsConnectionsCountKey: process.env.METRICS_CONNECTIONS_COUNT_KEY || 'cludus_gateway_connections_count',
  metricsMessagesCountKey: process.env.METRICS_MESSAGES_COUNT_KEY || 'cludus_gateway_messages_count',
  metricsMessagesTimerKey: process.env.METRICS_MESSAGES_TIMER_KEY || 'cludus_gateway_messages_latency',
  workerDelayInSeconds: Number.parseInt(process.env.WORKER_DELAY_IN_SECONDS || '') || 60,
  maxUserHeartbeatDelayInSeconds: Number.parseInt(process.env.MAX_USER_HEARTBEAT_DELAY_IN_SECONDS || '') || 600,
};

const configureLogging = () => {
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
    level: isLive ? 'info' : 'debug',
    format: winston_format.combine(
      winston_format.colorize(),
      winston_format.splat(),
      winston_format.timestamp(),
      winston_format.printf(({ timestamp, level, message }) => {
        return `[${timestamp}] ${level}: ${message}`;
      })
    ),
    transports: loggerTransports,
  });
  ['debug', 'info', 'warn', 'error'].forEach((level) => {
    (console as any)[level] = (...args: any[]) => {
      (logger as any)[level].apply(logger, args);
    };
  });
  if (hasLoki) {
    console.debug('Collecting logs to %s', lokiHost);
  }
};
configureLogging();

export default appConfig;
