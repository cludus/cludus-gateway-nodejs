import { User, UserFetcher } from '../model/types';

export class FakeUserFetcher implements UserFetcher {
  readonly userNotFoundMessage: string;

  constructor(userNotFoundMessage: string) {
    this.userNotFoundMessage = userNotFoundMessage;
  }

  fetch(token: string): Promise<User> {
    return new Promise<User>((resolve, reject) => {
      if (token) {
        resolve({ code: token, token });
      } else {
        reject(this.userNotFoundMessage);
      }
    });
  }
}
