import { User, UserFetcher } from "../types";

export class FakeUserFetcher implements UserFetcher {
  readonly userNotFoundMessage: string;

  constructor(userNotFoundMessage: string) {
    this.userNotFoundMessage = userNotFoundMessage;
  }

  fetch(token: string): Promise<User> {
    return new Promise((resolve, reject) => {
      if (!!token) {
        resolve({ token });
      } else {
        reject(this.userNotFoundMessage);
      }
    });
  }
}
