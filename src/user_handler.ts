import { User, UserSocket } from './types';

export class UserHandler<T> {
  userNotFoundMessage: string = 'User not found!';

  #users = new Map<string, User>();
  #sockets = new Map<string, UserSocket>();

  fetch(token: string): Promise<User> {
    return new Promise((resolve, reject) => {
      if (!!token) {
        resolve({ token });
      } else {
        reject(this.userNotFoundMessage);
      }
    });
  }

  set(user: User, socket: UserSocket) {
    this.#users.set(user.token, user);
    this.#sockets.set(user.token, socket);
  }

  delete(user: User) {
    this.#users.delete(user.token);
    this.#sockets.delete(user.token);
  }
}
