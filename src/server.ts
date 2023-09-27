import appConfig from './config';
import { HttpHandler } from "./handler/HttpHandler";
import { PrometheusMetricsHandler } from "./handler/MetricsHandler";
import { UserHandler } from "./handler/UserHandler";
import { WsHandler } from "./handler/WsHandler";
import { MetricsHandler } from "./handler/types";
import { User } from './model/types';

export class AppServer {
  #userHandler: UserHandler;

  constructor(userHandler: UserHandler) {
    this.#userHandler = userHandler;
  }

  start() {
    const metricsHandler: MetricsHandler = new PrometheusMetricsHandler();
    const httpHandler = new HttpHandler(this.#userHandler, metricsHandler);
    const wsHandler = new WsHandler(this.#userHandler, metricsHandler);
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

    const devTip = !appConfig.liveMode ? '(Press CTRL+C to quit)' : '';
    console.info('Cludus Gateway server started on port %d %s', appConfig.serverPort, devTip);
    console.info(' - WebSocket endpoint : %s', appConfig.wsPath);
    console.info(' - Metrics endpoint: %s', appConfig.metricsPath);
  }
}
