import { HttpHandler } from "./handler/HttpHandler";
import { PrometheusMetricsHandler } from "./handler/MetricsHandler";
import { UserHandler } from "./handler/UserHandler";
import { WsHandler } from "./handler/WsHandler";
import { MetricsHandler } from "./handler/types";
import { User } from './model/types';

export interface AppServerOptions {
  serverPort: number;
  wsPath: string;
  metricsPath?: string;
  liveMode?: boolean;
}

export class AppServer {
  #userHandler: UserHandler;
  #options: AppServerOptions;

  constructor(userHandler: UserHandler, options: AppServerOptions) {
    this.#userHandler = userHandler;
    this.#options = options;
  }

  start() {
    let metricsHandler: MetricsHandler | null = null;
    if (!!this.#options.metricsPath) {
      metricsHandler = new PrometheusMetricsHandler();
    }
    const httpHandler = new HttpHandler(this.#userHandler, metricsHandler, this.#options.wsPath, this.#options.metricsPath);
    const wsHandler = new WsHandler(this.#userHandler, metricsHandler);
    Bun.serve<User>({
      port: this.#options.serverPort,
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

    const devTip = !this.#options.liveMode ? '(Press CTRL+C to quit)' : '';
    console.info('Cludus Gateway server started on port %d %s', this.#options.serverPort, devTip);
    console.info(' - WebSocket endpoint : %s', this.#options.wsPath);
    if (!!this.#options.metricsPath) {
      console.info(' - Metrics endpoint: %s', this.#options.metricsPath);
    }
  }
}
