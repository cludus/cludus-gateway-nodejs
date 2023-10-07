import { FakeUserFetcher } from '../fetcher/FakeUserFetcher';
import { User, UserFetcher, UserSocket } from '../model/types';

export class UserHandler implements UserFetcher {
  readonly userNotFoundMessage: string;
  readonly userFetcher: UserFetcher;
  readonly users = new Map<string, User>();
  readonly sockets = new Map<string, UserSocket>();
  readonly heartbeats = new Map<string, Date>();

  constructor(userFetcher?: UserFetcher)
  constructor(userFetcher?: UserFetcher, userNotFoundMessage?: string) {
    this.userNotFoundMessage = userNotFoundMessage || 'User not found!';
    this.userFetcher = userFetcher || new FakeUserFetcher(this.userNotFoundMessage);
  }

  fetch(token: string): Promise<User> {
    return this.userFetcher.fetch(token);
  }

  get(token: string): UserSocket | undefined {
    return this.sockets.get(token);
  }

  set(user: User, socket: UserSocket) {
    this.users.set(user.code, user);
    this.sockets.set(user.code, socket);
    this.heartbeat(user);
  }

  count() {
    return this.users.size;
  }

  heartbeat(user: User) {
    this.heartbeats.set(user.code, new Date());
  }

  checkHeartbeats(maxUserHeartbeatDelayInSeconds: number) {
    this.heartbeats.forEach((lastHeartBeat, userCode) => {
      const hearbeatDiff = (new Date().getTime() - lastHeartBeat.getTime()) / 1000;
      console.debug('- Checking connection activity of %s with last heartbeat %d seconds ago (max allowed %d)',
        userCode, hearbeatDiff, maxUserHeartbeatDelayInSeconds);
      if (hearbeatDiff > maxUserHeartbeatDelayInSeconds) {
        console.debug('  Closing connection of %s due to inactivity!', userCode);
        const socket = this.sockets.get(userCode);
        if (socket) {
          socket.close();
        }
      }
    });
  }

  delete(user: User) {
    this.deleteByCode(user.code);
  }

  deleteByCode(userCode: string) {
    this.users.delete(userCode);
    this.sockets.delete(userCode);
    this.heartbeats.delete(userCode);
  }

  closeAllConnections() {
    this.sockets.forEach((socket, userCode) => {
      socket.close();
      this.deleteByCode(userCode);
    });
  }
}
