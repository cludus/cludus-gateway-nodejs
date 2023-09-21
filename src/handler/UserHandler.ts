import { FakeUserFetcher } from '../fetcher/FakeUserFetcher';
import { User, UserFetcher, UserSocket } from '../model/types';

export class UserHandler implements UserFetcher {
  readonly userNotFoundMessage: string;

  #userFetcher: UserFetcher;
  #users = new Map<string, User>();
  #sockets = new Map<string, UserSocket>();
  #heartbeats = new Map<string, Date>();

  constructor(userFetcher?: UserFetcher)
  constructor(userFetcher?: UserFetcher, userNotFoundMessage?: string) {
    this.userNotFoundMessage = userNotFoundMessage || 'User not found!';
    this.#userFetcher = userFetcher || new FakeUserFetcher(this.userNotFoundMessage);
  }

  // check heartbeat every x time to disconnect non-active users

  fetch(token: string): Promise<User> {
    return this.#userFetcher.fetch(token);
  }

  get(token: string): UserSocket | undefined {
    return this.#sockets.get(token);
  }

  set(user: User, socket: UserSocket) {
    this.#users.set(user.token, user);
    this.#sockets.set(user.token, socket);
    this.heartbeat(user);
  }

  count() {
    return this.#users.size;
  }

  heartbeat(user: User) {
    this.#heartbeats.set(user.token, new Date());
  }

  delete(user: User) {
    // const socket = this.#sockets.get(user.token);
    // if (!!socket) {
    //   socket.close();
    // }
    this.#users.delete(user.token);
    this.#sockets.delete(user.token);
    this.#heartbeats.delete(user.token);
  }
}
