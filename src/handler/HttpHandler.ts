import appConfig from '../config';
import { Server } from 'bun';
import { UserHandler } from './UserHandler';
import { MetricsHandler } from './MetricsHandler';

export class HttpHandler {
  #userHandler: UserHandler;
  #metricsHandler: MetricsHandler;

  constructor(userHandler: UserHandler, metricsHandler: MetricsHandler) {
    this.#userHandler = userHandler;
    this.#metricsHandler = metricsHandler;
  }

  async fetch(request: Request, server: Server) {
    const url = new URL(request.url);
    if (url.pathname === appConfig.wsPath) {
      // websocket request
      const userToken = request.headers.get('authorization');
      try {
        const user = await this.#userHandler.fetch(userToken || '');
        const success = server.upgrade(request, { data: user });
        return success
          ? undefined
          : new Response('WebSocket upgrade error', { status: 400 });
      } catch (e) {
        return new Response(e as string | undefined, { status: 401 });
      }
    } else if (url.pathname === appConfig.metricsPath) {
      // metrics request
      console.debug('... Metrics requested');
      const metrics = await this.#metricsHandler.metrics();
      return new Response(metrics, {
        headers: {
          'Content-Type': this.#metricsHandler.contentType(),
        },
      });
    }
    return new Response('Cludus Gateway!');
  }
}
