import 'jest';
import { UserHandler } from '../src/UserHandler';
import { UserMessage } from '../src/UserMessage';
import { UserSocket } from '../src/types';

describe('UserHandler tests', () => {
  let instance: UserHandler;

  beforeEach(() => {
    instance = new UserHandler({});
  });

  it('should use defined messages texts', () => {
    const text = 'test-text';
    const handler = new UserHandler({
      messageDeliveredText: text,
      target404Text: text,
    });
    expect(handler.messageDeliveredText).toBe(text);
    expect(handler.target404Text).toBe(text);
  });

  it('should register sessions count', () => {
    expect(instance.activeCount()).toBe(0);
    expect(instance.inactiveCount()).toBe(0);

    const token = 'test-token';
    instance.setSession(token, new TestSocket());
    expect(instance.activeCount()).toBe(1);
    expect(instance.inactiveCount()).toBe(0);

    instance.removeSession(token);
    expect(instance.activeCount()).toBe(0);
    expect(instance.inactiveCount()).toBe(1);

    instance.setSession('', new TestSocket());
    expect(instance.activeCount()).toBe(0);
    expect(instance.inactiveCount()).toBe(1);
  });

  it('should throw error if message is not valid', () => {
    expect(() => instance.deliverMessage('test-token', new TestSocket(), '-')).toThrow();
  });

  it('should answer with validation error', () => {
    const socket = new TestSocket();
    expect(socket.data).toBeUndefined();

    const token = 'test-token';
    const msgWithoutUser = new UserMessage({ message: 'Test' });
    instance.deliverMessage(token, socket, JSON.stringify(msgWithoutUser));
    expect(socket.data).toBeDefined();
    let responseMsg = UserMessage.parse(socket.data!);
    expect(responseMsg.isError).toBeTruthy();
    expect(responseMsg.message).toBe(msgWithoutUser.validate());

    socket.data = undefined;
    expect(socket.data).toBeUndefined();

    const msgWithoutMessage = new UserMessage({ user: 'Test' });
    instance.deliverMessage(token, socket, JSON.stringify(msgWithoutMessage));
    expect(socket.data).toBeDefined();
    responseMsg = UserMessage.parse(socket.data!);
    expect(responseMsg.isError).toBeTruthy();
    expect(responseMsg.message).toBe(msgWithoutMessage.validate());
  });

  it('should answer with messageDelivered text on valid message', () => {
    const socket = new TestSocket();
    expect(socket.data).toBeUndefined();

    const token = 'test-token';
    instance.setSession(token, socket);

    const msg = new UserMessage({ user: token, message: 'Test' });
    instance.deliverMessage(token, socket, JSON.stringify(msg));
    expect(socket.data).toBeDefined();
    let responseMsg = UserMessage.parse(socket.data!);
    expect(responseMsg.isError).toBeFalsy();
    expect(responseMsg.message).toBe(instance.messageDeliveredText);
  });

  it('should answer with target404 text on message to non registered user', () => {
    const socket = new TestSocket();
    expect(socket.data).toBeUndefined();

    const token = 'test-token';
    const msg = new UserMessage({ user: token, message: 'Test' });
    instance.deliverMessage(token, socket, JSON.stringify(msg));
    expect(socket.data).toBeDefined();
    let responseMsg = UserMessage.parse(socket.data!);
    expect(responseMsg.isError).toBeTruthy();
    expect(responseMsg.message).toBe(instance.target404Text);
  });
});

class TestSocket implements UserSocket {
  data?: string;

  send(data: string): void {
    this.data = data;
  }
}
