export interface StringMap<T> {
  [key: string]: T;
}

export interface UserSocket {
  send(data: string): void;
}
