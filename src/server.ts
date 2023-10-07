import { IncomingMessage, Server, ServerResponse, createServer as httpCreateServer } from 'http';
import { HttpHandler } from './handler/HttpHandler';
import { PrometheusMetricsHandler } from './handler/MetricsHandler';
import { UserHandler } from './handler/UserHandler';
import { WsHandler } from './handler/WsHandler';
import { MetricsHandler } from './handler/types';
import { WebSocket, WebSocketServer } from 'ws';

export interface AppServerOptions {
  serverPort: number;
  wsPath: string;
  metricsPath?: string;
  liveMode?: boolean;
}

export class AppServer {
  readonly userHandler: UserHandler;
  readonly options: AppServerOptions;

  wsServer?: WebSocketServer;
  httpServer?: Server<typeof IncomingMessage, typeof ServerResponse>;

  constructor(userHandler: UserHandler, options: AppServerOptions) {
    this.userHandler = userHandler;
    this.options = options;
  }

  start() {
    let metricsHandler: MetricsHandler | null = null;
    if (this.options.metricsPath) {
      metricsHandler = new PrometheusMetricsHandler();
    }
    const wsHandler = new WsHandler(this.userHandler, metricsHandler);

    this.wsServer = new WebSocketServer({
      path: this.options.wsPath,
      noServer: true,
    });
    this.wsServer.on('connection', (socket: WebSocket, request: IncomingMessage) => wsHandler.handle(socket, request));

    const httpHandler = new HttpHandler(metricsHandler, this.options.metricsPath);

    this.httpServer = httpCreateServer(
      (request: IncomingMessage, response: ServerResponse<IncomingMessage>) => httpHandler.handle(request, response));
    this.httpServer.on('upgrade', (request, socket, head) => {
      this.wsServer!.handleUpgrade(request, socket, head, socket => {
        this.wsServer!.emit('connection', socket, request);
      });
    });
    this.httpServer.listen(this.options.serverPort, () => {
      const devTip = !this.options.liveMode ? '(Press CTRL+C to quit)' : '';
      console.info('Cludus Gateway server started on port %d %s', this.options.serverPort, devTip);
      console.info(' - WebSocket endpoint: %s', this.options.wsPath);
      if (this.options.metricsPath) {
        console.info(' - Metrics endpoint: %s', this.options.metricsPath);
      }
    });
  }

  stop(callback?: (err?: Error) => void) {
    this.userHandler.closeAllConnections();
    if (this.wsServer) {
      this.wsServer.close(() => {
        this.httpServer?.closeAllConnections();
        this.httpServer?.close(callback);
      });
    } else if (callback) {
      callback();
    }
  }
}
