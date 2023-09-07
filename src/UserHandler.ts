import { WebSocket } from 'ws';
import { StringMap } from './types';

class UserHandler {
  #users: StringMap<WebSocket> = {};
  #activeTokens: string[] = [];
  #inactiveTokens: string[] = [];

  setSession(token: string, socket: WebSocket): boolean {
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

  deliverMessage(token: string, socket: WebSocket, data: string) {
    try {
      const userMessage = UserMessage.parse(data);
      const error = userMessage.validate()
      if (!!error) {
        socket.send(error);
        return;
      }
      if (!!this.#users[userMessage.user!]) {
        const targetMessage = new UserMessage({
          user: token,
          message: userMessage.message,
        });
        this.#users[userMessage.user!].send(JSON.stringify(targetMessage));
        socket.send('Message delivered.');
      } else {
        socket.send('Target user could not be found.');
      }
    } catch (e) {
      console.error('UserHandler.deliverMessage', e);
      socket.send('Error processing message.');
    }
  }

  activeCount(): number {
    return this.#activeTokens.length;
  }

  inactiveCount(): number {
    return this.#inactiveTokens.length;
  }
}

class UserMessage {
  user?: string;
  message?: string;

  constructor(data: Partial<UserMessage>) {
    Object.assign(this, data);
  }

  validate(): string | null {
    if (!this.user) {
      return 'Invalid user.';
    }
    if (!this.message) {
      return 'Invalid message.';
    }
    return null;
  }

  static parse = (json: string): UserMessage => {
    const jsonObject = JSON.parse(json);
    return new UserMessage(jsonObject);
  };
}

export { UserHandler };
