import { describe, expect, mock, test } from 'bun:test';
import { UserHandler } from '../../src/handler/UserHandler';
import { User, UserSocket } from '../../src/model/types';

describe('UserHandler tests', () => {
  test('should use fetcher to fetch user', () => {
    const fetcher = mock((token: string): Promise<User> => {
      return new Promise((resolve) => {
        resolve({ token });
      })
    });
    const userHandler = new UserHandler({ fetch: fetcher });
    userHandler.fetch('test-token');
    expect(fetcher).toHaveBeenCalled();
  });

  test('should register sessions', () => {
    const userHandler = new UserHandler();
    const token = 'test-token';
    expect(userHandler.get(token)).toBeUndefined();

    const user: User = { token };
    const socket: UserSocket = new TestSocket(token);
    userHandler.set(user, socket);
    expect(userHandler.get(token)).toBeDefined();
    expect(userHandler.get(token)!.remoteAddress).toEqual(token);

    userHandler.delete(user);
    expect(userHandler.get(token)).toBeUndefined();
  });

  test('should count sessions', () => {
    const userHandler = new UserHandler();
    const count = 10;
    for (let i = 0; i < count; i++) {
      const token = `user-${i}`;
      const user: User = { token };
      userHandler.set(user, new TestSocket(token));
    }
    expect(userHandler.count()).toEqual(count);
  });
});

class TestSocket implements UserSocket {
  readonly remoteAddress: string;

  constructor(remoteAddress: string) {
    this.remoteAddress = remoteAddress;
  }

  send(_: string): void { }

  close(): void { }
}
