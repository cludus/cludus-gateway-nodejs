import { sign as jwtSign } from 'jsonwebtoken';
import { JwtUserFetcher } from '../../src/fetcher/JwtUserFetcher';

describe('JwtUserFetcher tests', () => {
  const secretKey = '404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970';
  const issuer = 'cludus';
  const jwtToken = (payload: object): string => {
    return jwtSign(payload, secretKey, {
      algorithm: 'HS256',
      issuer,
    });
  };

  test('should return user with code if token is a valid jwt', async () => {
    const userFetcher = new JwtUserFetcher(secretKey, issuer);
    const userCode = 'test';
    const token = jwtToken({
      exp: Math.floor(Date.now() / 1000) + (60 * 60),
      sub: userCode,
    });
    const user = await userFetcher.fetch(`Bearer ${token}`);
    expect(user).toBeDefined();
    expect(user.code).toEqual(userCode);
    expect(user.token).toEqual(token);
  });

  test('should throw if token is not a valid jwt', async () => {
    const userFetcher = new JwtUserFetcher(secretKey, issuer);
    expect(userFetcher.fetch('')).rejects.toMatch(userFetcher.userNotFoundMessage);
  });

  test('should throw if token is empty', async () => {
    const userFetcher = new JwtUserFetcher(secretKey, issuer);
    expect(userFetcher.fetch('')).rejects.toMatch(userFetcher.userNotFoundMessage);
  });
});
