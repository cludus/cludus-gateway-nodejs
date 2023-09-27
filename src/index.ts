import appConfig from './config';
import { User } from './model/types';
import { UserHandler } from './handler/UserHandler';
import { MetricsHandler } from './handler/types';
import { HttpHandler } from './handler/HttpHandler';
import { WsHandler } from './handler/WsHandler';
import { PrometheusMetricsHandler } from './handler/MetricsHandler';
import { configureLogging } from './logger';

configureLogging();

const userHandler = new UserHandler();
const metricsHandler: MetricsHandler = new PrometheusMetricsHandler();
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

const devTip = appConfig.devMode ? '(Press CTRL+C to quit)' : '';
console.info('Cludus Gateway server started on port %d %s', appConfig.serverPort, devTip);
console.info(' - WebSocket endpoint : %s', appConfig.wsPath);
console.info(' - Metrics endpoint: %s', appConfig.metricsPath);

if (appConfig.workerDelayInSeconds > 0) {
  const checkHeartBeatsKey = 'check-heartbeats';

  const workerURL = new URL('./worker.ts', import.meta.url).href;
  const worker = new Worker(workerURL, {
    env: {
      [checkHeartBeatsKey]: String(appConfig.workerDelayInSeconds),
    }
  });

  worker.onmessage = (event: MessageEvent<string>) => {
    if (event.data == checkHeartBeatsKey) {
      userHandler.checkHeartbeats(appConfig.maxUserHeartbeatDelayInSeconds);
    }
  };
}
