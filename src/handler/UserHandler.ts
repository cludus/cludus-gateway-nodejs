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

  checkHeartbeats(maxUserHeartbeatDelayInSeconds: number) {
    this.#heartbeats.forEach((v, k) => {
      const hearbeatDiff = (new Date().getTime() - v.getTime()) / 1000;
      console.debug('- Checking connection activity of %s with last heartbeat %d seconds ago (max allowed %d)',
        k, hearbeatDiff, maxUserHeartbeatDelayInSeconds);
      if (hearbeatDiff > maxUserHeartbeatDelayInSeconds) {
        console.debug('  Closing connection of %s due to inactivity!', k);
        const socket = this.#sockets.get(k);
        if (!!socket) {
          socket.close();
        }
      }
    });
  }

  delete(user: User) {
    this.#users.delete(user.token);
    this.#sockets.delete(user.token);
    this.#heartbeats.delete(user.token);
  }
}
