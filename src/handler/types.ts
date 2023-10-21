export interface MetricsHandler {
  metrics(): Promise<string>;

  contentType(): string;

  setConnectionsCount(count: number): void;

  incrementMessagesCount(): void;

  startTimer(): () => number;
}

export interface DiscoveryHandler {
  init(): Promise<void>;
}
