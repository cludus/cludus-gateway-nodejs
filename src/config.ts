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
const appConfig: AppConfig = {
  serverHost: process.env.HOST ?? '',
  serverPort: Number.parseInt(process.env.PORT ?? '') || 8080,
  wsPath: process.env.WS_PATH ?? '/ws',
  metricsPath: process.env.METRICS_PATH ?? '/actuator/prometheus',
  liveMode: isLive,
  metricsConnectionsCountKey: process.env.METRICS_CONNECTIONS_COUNT_KEY ?? 'cludus_gateway_connections_count',
  metricsMessagesCountKey: process.env.METRICS_MESSAGES_COUNT_KEY ?? 'cludus_gateway_messages_count',
  metricsMessagesTimerKey: process.env.METRICS_MESSAGES_TIMER_KEY ?? 'cludus_gateway_messages_latency',
  workerDelayInSeconds: Number.parseInt(process.env.WORKER_DELAY_IN_SECONDS ?? '') || 60,
  maxUserHeartbeatDelayInSeconds: Number.parseInt(process.env.MAX_USER_HEARTBEAT_DELAY_IN_SECONDS ?? '') || 600,
  jwtSecretKey: process.env.JWT_SECRET_KEY ?? '',
  jwtIssuer: process.env.JWT_ISSUER ?? '',
  discoveryName: process.env.DISCOVER_NAME ?? 'cludus-gateway',
  discoveryHost: process.env.DISCOVER_HOST ?? '',
  discoveryPort: Number.parseInt(process.env.DISCOVER_PORT ?? '') || 8500,
};

export default appConfig;
