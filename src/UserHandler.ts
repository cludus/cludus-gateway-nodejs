import { UserMessage } from './UserMessage';
import { StringMap, UserSocket } from './types';

class UserHandler {
  messageDeliveredText: string = 'Message delivered.';
  target404Text: string = 'Target user could not be found.';

  constructor(data: Partial<UserHandler>) {
    Object.assign(this, data);
  }

  #users: StringMap<UserSocket> = {};
  #activeTokens: string[] = [];
  #inactiveTokens: string[] = [];

  setSession(token: string, socket: UserSocket): boolean {
    if (!!token) {
      this.#users[token] = socket;
      if (!this.#activeTokens.includes(token)) {
        this.#activeTokens.push(token);
      }
      return true;
    }
    return false;
  }

  removeSession(token: string) {
    delete this.#users[token];
    const index = this.#activeTokens.indexOf(token);
    if (index >= 0) {
      this.#activeTokens.splice(index, 1);
    }
    if (!this.#inactiveTokens.includes(token)) {
      this.#inactiveTokens.push(token);
    }
  }

  deliverMessage(token: string, socket: UserSocket, data: string) {
    const userMessage = UserMessage.parse(data);
    const error = userMessage.validate()
    if (!!error) {
      socket.send(JSON.stringify(UserMessage.systemError(error)));
      return;
    }
    if (!!this.#users[userMessage.user!]) {
      const targetMessage = new UserMessage({
        user: token,
        message: userMessage.message,
      });
      this.#users[userMessage.user!].send(JSON.stringify(targetMessage));
      socket.send(JSON.stringify(UserMessage.systemMessage(this.messageDeliveredText)));
    } else {
      socket.send(JSON.stringify(UserMessage.systemError(this.target404Text)));
    }
  }

  activeCount(): number {
    return this.#activeTokens.length;
  }

  inactiveCount(): number {
    return this.#inactiveTokens.length;
  }
}

export { UserHandler };
