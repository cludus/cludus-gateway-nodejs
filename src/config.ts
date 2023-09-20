export interface AppConfig {
  serverPort: number;
  wsPath: string;
  prometheusPath: string;
  liveMode: boolean;
  devMode: boolean;
}

const isLive = process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'live';
const appConfig: AppConfig = {
  serverPort: Number.parseInt(process.env.PORT || '') || 8080,
  wsPath: process.env.WS_PATH || '/websocket',
  prometheusPath: process.env.PROMETHEUS_PATH || '/actuator/prometheus',
  liveMode: isLive,
  devMode: !isLive,
};

if (isLive) {
  console.debug = () => { };
}

export default appConfig;
