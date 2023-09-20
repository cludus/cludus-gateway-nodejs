export interface AppConfig {
  serverPort: number;
  wsPath: string;
  prometheusPath: string;
  liveMode: boolean;
  devMode: boolean;
  metricsConnectionsCountKey: string;
  metricsMessagesCountKey: string;
  metricsMessagesTimerKey: string;
}

const isLive = process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'live';
const appConfig: AppConfig = {
  serverPort: Number.parseInt(process.env.PORT || '') || 8080,
  wsPath: process.env.WS_PATH || '/websocket',
  prometheusPath: process.env.PROMETHEUS_PATH || '/actuator/prometheus',
  liveMode: isLive,
  devMode: !isLive,
  metricsConnectionsCountKey: process.env.PROMETHEUS_METRICS_CONNECTIONS_COUNT_KEY || 'cludus_gateway_connections_count',
  metricsMessagesCountKey: process.env.PROMETHEUS_METRICS_MESSAGES_COUNT_KEY || 'cludus_gateway_messages_count',
  metricsMessagesTimerKey: process.env.PROMETHEUS_METRICS_MESSAGES_TIMER_KEY || 'cludus_gateway_messages_latency',
};

if (isLive) {
  console.debug = () => { };
}

export default appConfig;
