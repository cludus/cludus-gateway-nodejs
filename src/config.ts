export interface AppConfig {
  serverPort: number;
  wsPath: string;
  prometheusPath: string;
}

const appConfig: AppConfig = {
  serverPort: Number.parseInt(process.env.PORT || '') || 8080,
  wsPath: process.env.WS_PATH || '/websocket',
  prometheusPath: process.env.PROMETHEUS_PATH || '/actuator/prometheus',
};

export default appConfig;
