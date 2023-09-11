export interface AppConfig {
  wsPort: number;
  wsPath: string;
}

const appConfig: AppConfig = {
  wsPort: Number.parseInt(process.env.WS_PORT || '') || 8080,
  wsPath: process.env.WS_PATH || '/websocket',
};

export default appConfig;
