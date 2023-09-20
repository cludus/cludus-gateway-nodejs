import appConfig from './config';
import { User, UserSocket } from './model/types';
import { UserHandler } from './handler/UserHandler';
import { MetricsHandler } from './handler/MetricsHandler';
import { HttpHandler } from './handler/HttpHandler';
import { WsHandler } from './handler/WsHandler';

const userHandler = new UserHandler<UserSocket>();
const metricsHandler = new MetricsHandler();
const httpHandler = new HttpHandler<UserSocket>(userHandler, metricsHandler);
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
