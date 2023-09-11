export interface User {
  token: string,
}

export interface UserSocket {
  send(data: string): void;
}
