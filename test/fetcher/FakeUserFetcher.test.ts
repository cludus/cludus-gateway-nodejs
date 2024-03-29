import { FakeUserFetcher } from '../../src/fetcher/FakeUserFetcher';

describe('FakeUserFetcher tests', () => {
  test('should return user if token is not empty', async () => {
    const userFetcher = new FakeUserFetcher('-');
    const token = 'token';
    const user = await userFetcher.fetch(token);
    expect(user).toBeDefined();
    expect(user.token).toEqual(token);
  });

  test('should throw if token is empty', async () => {
    const userFetcher = new FakeUserFetcher('-');
    await expect(userFetcher.fetch('')).rejects.toMatch(userFetcher.userNotFoundMessage);
  });
});
