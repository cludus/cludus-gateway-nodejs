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

if (isLive) {
  console.debug = () => { };
}

export default appConfig;
