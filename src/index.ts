import appConfig from './config';
import { User } from './model/types';
import { UserHandler } from './handler/UserHandler';
import { MetricsHandler } from './handler/MetricsHandler';
import { HttpHandler } from './handler/HttpHandler';
import { WsHandler } from './handler/WsHandler';

const userHandler = new UserHandler();
const metricsHandler = new MetricsHandler();
const httpHandler = new HttpHandler(userHandler, metricsHandler);
const wsHandler = new WsHandler(userHandler, metricsHandler);

Bun.serve<User>({
  port: appConfig.serverPort,
  async fetch(req, server) {
    return httpHandler.fetch(req, server);
  },
  websocket: {
    open(ws) {
      wsHandler.open(ws);
    },
    message(ws, message) {
      wsHandler.message(ws, message);
    },
    close(ws) {
      wsHandler.close(ws);
    },
  },
});

const devTip = appConfig.devMode ? '(Press CTRL+C to quit)' : ''
console.log('Cludus Gateway server started on port %i %s', appConfig.serverPort, devTip);
console.log(' - WebSocket endpoint : %s', appConfig.wsPath);
console.log(' - Prometheus endpoint: %s', appConfig.prometheusPath);

if (appConfig.workerDelayInSeconds > 0 && appConfig.maxUserHeartbeatDelayInSeconds > appConfig.workerDelayInSeconds) {
  const workerURL = new URL('../worker.ts', import.meta.url).href;
  const worker = new Worker(workerURL);

  worker.onmessage = () => {
    userHandler.checkHeartbeats(appConfig.maxUserHeartbeatDelayInSeconds);
  };
}
