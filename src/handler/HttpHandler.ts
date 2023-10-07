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
      response.writeHead(200);
      response.setHeader('Content-Type', this.metricsHandler.contentType());
      response.end(metrics);
    } else {
      response.writeHead(200);
      // response.setHeader('Content-Type', 'application/json');
      response.end('Cludus Gateway!');
    }
  }
}
