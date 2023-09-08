import 'jest';
import { UserHandler } from '../src/UserHandler';
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
    instance.setSession(token, new MockSocket());
    expect(instance.activeCount()).toBe(1);
    expect(instance.inactiveCount()).toBe(0);

    instance.removeSession(token);
    expect(instance.activeCount()).toBe(0);
    expect(instance.inactiveCount()).toBe(1);

    instance.setSession('', new MockSocket());
    expect(instance.activeCount()).toBe(0);
    expect(instance.inactiveCount()).toBe(1);
  });

  it('should throw error if message is not valid', async () => {
    expect(() => instance.deliverMessage('test-token', new MockSocket(), '-')).toThrow();
  });
});

class MockSocket implements UserSocket {
  send(data: string): void {
  }
}
