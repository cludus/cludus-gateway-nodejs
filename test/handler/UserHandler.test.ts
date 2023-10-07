import { UserHandler } from '../../src/handler/UserHandler';
import { User, UserSocket } from '../../src/model/types';

const setSystemTime = jest.setSystemTime;
const mock = jest.fn;
const useFakeTimers = jest.useFakeTimers;

describe('UserHandler tests', () => {
  const consoleDebug = jest.spyOn(console, 'debug').mockImplementation(() => { });
  const consoleInfo = jest.spyOn(console, 'info').mockImplementation(() => { });

  afterAll(() => {
    consoleDebug.mockRestore();
    consoleInfo.mockRestore();
  });

  test('should use fetcher to fetch user', () => {
    const fetcher = mock((token: string): Promise<User> => {
      return new Promise((resolve) => {
        resolve({ code: token, token });
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

    const user: User = { code: token, token };
    const socket: UserSocket = new TestSocket(token);
    userHandler.set(user, socket);
    expect(userHandler.get(token)).toBeDefined();
    expect(userHandler.get(token)!.url).toEqual(token);

    userHandler.delete(user);
    expect(userHandler.get(token)).toBeUndefined();
  });

  test('should count sessions', () => {
    const userHandler = new UserHandler();
    const count = 10;
    for (let i = 0; i < count; i++) {
      const token = `user-${i}`;
      const user: User = { code: token, token };
      userHandler.set(user, new TestSocket(token));
    }
    expect(userHandler.count()).toEqual(count);
  });

  test('should check connections heartbeats', async () => {
    useFakeTimers();
    const userHandler = new UserHandler();
    const user: User = { code: 'token', token: 'token' };
    const closeFn = mock(() => { });
    setSystemTime(new Date('1997-12-25T00:00:00.000Z'));
    userHandler.set(user, new TestSocket('-', closeFn));
    userHandler.checkHeartbeats(10);
    setSystemTime(new Date('1997-12-25T00:00:11.000Z'));
    userHandler.checkHeartbeats(10);
    expect(closeFn).toHaveBeenCalledTimes(1);
    setSystemTime();
  });
});

class TestSocket implements UserSocket {
  readonly url: string;
  readonly closeFn?: Function;

  constructor(url: string, closeFn?: Function) {
    this.url = url;
    this.closeFn = closeFn;
  }

  send(_: string) { }

  close() {
    if (this.closeFn != null) {
      this.closeFn.apply(this);
    }
  }
}
