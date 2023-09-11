export interface AppConfig {
  serverPort: number;
  wsPath: string;
}

const appConfig: AppConfig = {
  serverPort: Number.parseInt(process.env.PORT || '') || 8080,
  wsPath: process.env.WS_PATH || '/websocket',
};

export default appConfig;
