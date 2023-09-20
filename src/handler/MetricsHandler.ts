import appConfig from '../config';
import { Counter, Gauge, Histogram, Registry } from 'prom-client';

export class MetricsHandler {
  #promRegistry: Registry;
  #promConnsCounter: Gauge;
  #promMsgsCounter: Counter;
  #promMsgsTimer: Histogram;

  constructor() {
    this.#promRegistry = new Registry();
    this.#promConnsCounter = new Gauge({
      name: appConfig.metricsConnectionsCountKey,
      help: 'Cludus Gateway Connections count Gauge',
      registers: [this.#promRegistry],
    });
    this.#promMsgsCounter = new Counter({
      name: appConfig.metricsMessagesCountKey,
      help: 'Cludus Gateway Messages Counter',
      registers: [this.#promRegistry],
    });
    this.#promMsgsTimer = new Histogram({
      name: appConfig.metricsMessagesTimerKey,
      help: 'Cludus Gateway Messages Latency Histogram',
      registers: [this.#promRegistry],
    });
  }

  metrics(): Promise<string> {
    return this.#promRegistry.metrics();
  }

  contentType(): string {
    return this.#promRegistry.contentType;
  }

  setConnectionsCount(count: number) {
    this.#promConnsCounter.set(count);
  }

  incrementMessagesCount() {
    this.#promMsgsCounter.inc();
  }

  startTimer(): () => number {
    return this.#promMsgsTimer.startTimer();
  }
}
