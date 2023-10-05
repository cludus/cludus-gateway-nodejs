export interface User {
  code: string,
  token: string,
}

export interface UserFetcher {
  fetch(token: string): Promise<User>;
}

export interface UserSocket {
  readonly remoteAddress: string;

  send(data: string): void;

  close(): void;
}

export enum ServerMessageType {
  ACK = 'ACK',
  ERROR = 'ERROR',
  MESSAGE = 'MESSAGE',
}

export enum UserMessageType {
  SEND = 'SEND',
  HEARTBEAT = 'HEARTBEAT',
}
