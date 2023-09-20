import { FakeUserFetcher } from '../fetcher/FakeUserFetcher';
import { User, UserFetcher } from '../model/types';

export class UserHandler<T> implements UserFetcher {
  readonly userNotFoundMessage: string;

  #userFetcher: UserFetcher;
  #users = new Map<string, User>();
  #sockets = new Map<string, T>();

  constructor(userFetcher?: UserFetcher)
  constructor(userFetcher?: UserFetcher, userNotFoundMessage?: string) {
    this.userNotFoundMessage = userNotFoundMessage || 'User not found!';
    this.#userFetcher = userFetcher || new FakeUserFetcher(this.userNotFoundMessage);
  }

  fetch(token: string): Promise<User> {
    return this.#userFetcher.fetch(token);
  }

  get(token: string): T | undefined {
    return this.#sockets.get(token);
  }

  set(user: User, socket: T) {
    this.#users.set(user.token, user);
    this.#sockets.set(user.token, socket);
  }

  count() {
    return this.#users.size;
  }

  delete(user: User) {
    this.#users.delete(user.token);
    this.#sockets.delete(user.token);
  }
}
