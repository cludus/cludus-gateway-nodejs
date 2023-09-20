export interface User {
  token: string,
}

export interface UserFetcher {
  fetch(token: string): Promise<User>;
}

export interface UserSocket {
  send(data: string): void;
}
