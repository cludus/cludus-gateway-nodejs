export interface MetricsHandler {
    metrics(): Promise<string>;

    contentType(): string;

    setConnectionsCount(count: number): void;

    incrementMessagesCount(): void;

    startTimer(): () => number;
}
