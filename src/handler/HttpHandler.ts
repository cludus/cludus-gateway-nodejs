import { IncomingMessage, ServerResponse } from 'http';
import { MetricsHandler } from './types';

export class HttpHandler {
  readonly metricsHandler: MetricsHandler | null;
  readonly metricsPath?: string;

  constructor(metricsHandler: MetricsHandler | null, metricsPath?: string) {
    this.metricsHandler = metricsHandler;
    this.metricsPath = metricsPath;
  }

  async handle(request: IncomingMessage, response: ServerResponse<IncomingMessage>) {
    if (request.url === this.metricsPath && !!this.metricsHandler) {
      // metrics request
      console.debug('... Metrics requested');
      const metrics = await this.metricsHandler.metrics();
      response.setHeader('Content-Type', this.metricsHandler.contentType());
      response.writeHead(200);
      response.end(metrics);
    } else if (request.url === '/health') {
      response.writeHead(200);
      response.end('Cludus Gateway is UP!');
    } else {
      response.writeHead(200);
      response.end('Cludus Gateway!');
    }
  }
}
