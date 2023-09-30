import { describe, expect, test } from 'bun:test';
import { UserHandler } from '../src/handler/UserHandler';
import { AppServer, AppServerOptions } from '../src/server';
import { ServerMessageType, User, UserMessageType } from '../src/model/types';
import { UserMessage } from '../src/model/UserMessage';

describe('server tests', () => {
  test('user should get messages', async () => {
    const usersLen = 10;
    const messagesLen = 100;
    const users = createUsers(usersLen);
    expect(users.length).toEqual(usersLen);

    const userHandler = new UserHandler();
    const options = {
      serverPort: 8080,
      wsPath: '/ws',
    } as AppServerOptions;
    const server = new AppServer(userHandler, options);
    server.start();

    for (let user of users) {
      const socket = new WebSocket(`ws://localhost:${options.serverPort}${options.wsPath}`, {
        headers: {
          'authorization': user.token,
        },
      });
      await user.setSocket(socket);
      expect(user.messages.length).toEqual(0);
    }

    const messages = createMessages(messagesLen, users);
    expect(messages.length).toEqual(messagesLen);
    for (let message of messages) {
      message.user.send(message);
    }

    await Bun.sleep(1000);

    for (let user of users) {
      user.sortMessagesIds();
      expect(user.acks).toEqual(user.sends);
      expect(user.messages).toEqual(user.receives);
    }
  });
});

const createUsers = (count: number): TestUser[] => {
  const users: TestUser[] = [];
  for (let i = 0; i < count; i++) {
    users.push(new TestUser('user-' + i));
  }
  return users;
};

const createMessages = (count: number, users: TestUser[]): TestMessage[] => {
  const messages: TestMessage[] = [];
  for (let i = 0; i < count; i++) {
    const userIndex = Math.floor(Math.random() * users.length);
    const source = users[userIndex];
    const message = new TestMessage(source);
    message.id = 'message-' + i;
    message.action = UserMessageType.SEND;
    message.content = 'message-' + i;
    let targetIndex: number;
    do {
      targetIndex = Math.floor(Math.random() * users.length);
    } while (targetIndex == userIndex);
    const target = users[targetIndex];
    message.recipient = target.token;
    messages.push(message);

    source.sends.push(message.id);
    target.receives.push(message.id);
  }
  return messages;
};

class TestUser implements User {
  readonly token: string;
  // list of messages id received with ack action
  acks: string[];
  // list of messages id received with message action
  messages: string[];
  // list of id of messages created to send
  sends: string[];
  // list of id of messages created to receive
  receives: string[];
  socket?: WebSocket;

  constructor(token: string) {
    this.token = token;
    this.acks = [];
    this.messages = [];
    this.sends = [];
    this.receives = [];
  }

  setSocket(socket: WebSocket): Promise<boolean> {
    this.socket = socket;
    this.socket.addEventListener('message', (event) => {
      const json = JSON.parse(event.data.toString());
      const messageId = json['messageId'];
      const action = json['action'];
      if (!!messageId && !!action) {
        if (action == ServerMessageType.MESSAGE) {
          this.messages.push(messageId);
        } else if (action == ServerMessageType.ACK) {
          this.acks.push(messageId);
        }
      }
    });
    return new Promise<boolean>((resolve) => {
      socket.addEventListener('open', () => {
        resolve(true);
      });
    });
  }

  send(message: TestMessage) {
    this.socket?.send(message.toString());
  }

  sortMessagesIds() {
    this.acks.sort();
    this.messages.sort();
    this.sends.sort();
    this.receives.sort();
  }
}

class TestMessage extends UserMessage {
  readonly user: TestUser;

  constructor(user: TestUser) {
    super();
    this.user = user;
  }

  toString(): string {
    return JSON.stringify({
      id: this.id,
      action: this.action,
      recipient: this.recipient,
      content: this.content,
    });
  }
}
