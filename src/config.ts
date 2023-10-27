import 'dotenv/config';

export interface AppConfig {
  serverHost: string;
  serverPort: number;
  wsPath: string;
  metricsPath: string;
  liveMode: boolean;
  metricsConnectionsCountKey: string;
  metricsMessagesCountKey: string;
  metricsMessagesTimerKey: string;
  workerDelayInSeconds: number;
  maxUserHeartbeatDelayInSeconds: number;
  jwtSecretKey: string;
  jwtIssuer: string;
  discoveryName: string;
  discoveryHost: string;
  discoveryPort: number;
}

const isLive = process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'live';

let env: NodeJS.Dict<string> = process.env;
if (process.env.NODE_ENV === 'test') {
  env.HOST = '';
  env.METRICS_PATH = '';
  env.JWT_SECRET_KEY = '';
  env.DISCOVER_HOST = '';
}

const appConfig: AppConfig = {
  serverHost: env.HOST ?? '',
  serverPort: Number.parseInt(env.PORT ?? '') || 8080,
  wsPath: env.WS_PATH ?? '/ws',
  metricsPath: env.METRICS_PATH ?? '/actuator/prometheus',
  liveMode: isLive,
  metricsConnectionsCountKey: env.METRICS_CONNECTIONS_COUNT_KEY ?? 'cludus_gateway_connections_count',
  metricsMessagesCountKey: env.METRICS_MESSAGES_COUNT_KEY ?? 'cludus_gateway_messages_count',
  metricsMessagesTimerKey: env.METRICS_MESSAGES_TIMER_KEY ?? 'cludus_gateway_messages_latency',
  workerDelayInSeconds: Number.parseInt(env.WORKER_DELAY_IN_SECONDS ?? '') || 60,
  maxUserHeartbeatDelayInSeconds: Number.parseInt(env.MAX_USER_HEARTBEAT_DELAY_IN_SECONDS ?? '') || 600,
  jwtSecretKey: env.JWT_SECRET_KEY ?? '',
  jwtIssuer: env.JWT_ISSUER ?? '',
  discoveryName: env.DISCOVER_NAME ?? 'cludus-gateway',
  discoveryHost: env.DISCOVER_HOST ?? '',
  discoveryPort: Number.parseInt(env.DISCOVER_PORT ?? '') || 8500,
};

export default appConfig;
