import { describe, expect, mock, test } from 'bun:test';
import { UserHandler } from '../src/handler/UserHandler';
import { User } from '../src/model/types';

describe('UserHandler tests', () => {
  test('should use fetcher to fetch user', () => {
    const fetcher = mock((token: string): Promise<User> => {
      return new Promise((resolve) => {
        resolve({ token });
      })
    });
    const userHandler = new UserHandler<String>({ fetch: fetcher });
    userHandler.fetch('test-token');
    expect(fetcher).toHaveBeenCalled();
  });

  test('should register sessions', () => {
    const userHandler = new UserHandler<String>();
    const token = 'test-token';
    expect(userHandler.get(token)).toBeUndefined();

    const user: User = { token };
    userHandler.set(user, token);
    expect(userHandler.get(token)).toEqual(token);

    userHandler.delete(user);
    expect(userHandler.get(token)).toBeUndefined();
  });

  test('should count sessions', () => {
    const userHandler = new UserHandler<String>();
    const count = 10;
    for (let i = 0; i < count; i++) {
      const token = `user-${i}`;
      const user: User = { token };
      userHandler.set(user, token);
    }
    expect(userHandler.count()).toEqual(count);
  });
});
