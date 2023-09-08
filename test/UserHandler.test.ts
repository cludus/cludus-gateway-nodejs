import 'jest';
import { UserHandler } from '../src/UserHandler';
import { UserMessage } from '../src/UserMessage';
import { UserSocket } from '../src/types';

describe('UserHandler sessions', () => {
  let instance: UserHandler;

  beforeEach(() => {
    instance = new UserHandler();
  });

  it('should register sessions count', async () => {
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

  it('should throw error if message is not valid', async () => {
    expect(() => instance.deliverMessage('test-token', new TestSocket(), '-')).toThrow();
  });

  it('should answer with validation error', async () => {
    const socket = new TestSocket();
    expect(socket.data).toBeUndefined();

    const token = 'test-token';
    const msgWithoutUser = new UserMessage({ message: 'Test' });
    instance.deliverMessage(token, socket, JSON.stringify(msgWithoutUser));
    expect(socket.data).toBeDefined();
    let responseMsg = UserMessage.parse(socket.data!);
    expect(responseMsg.isError).toBe(true);
    expect(responseMsg.message).toBe(msgWithoutUser.validate());

    socket.data = undefined;
    expect(socket.data).toBeUndefined();

    const msgWithoutMessage = new UserMessage({ user: 'Test' });
    instance.deliverMessage(token, socket, JSON.stringify(msgWithoutMessage));
    expect(socket.data).toBeDefined();
    responseMsg = UserMessage.parse(socket.data!);
    expect(responseMsg.isError).toBe(true);
    expect(responseMsg.message).toBe(msgWithoutMessage.validate());
  });
});

class TestSocket implements UserSocket {
  data?: string;

  send(data: string): void {
    this.data = data;
  }
}
