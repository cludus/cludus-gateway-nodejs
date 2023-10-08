import { SignJWT } from 'jose';
import { JwtUserFetcher } from '../../src/fetcher/JwtUserFetcher';

describe('JwtUserFetcher tests', () => {
  const secretKey = '404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970';
  const signKey = new TextEncoder().encode(secretKey);
  const issuer = 'cludus';
  const jwtToken = async (subject: string, expirationTime: number | string, iss?: string): Promise<string> => {
    return await new SignJWT({})
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setIssuer(iss ?? issuer)
      .setExpirationTime(expirationTime)
      .setSubject(subject)
      .sign(signKey);
  };

  test('should return user with code if token is a valid jwt', async () => {
    const userFetcher = new JwtUserFetcher(secretKey, issuer);
    const userCode = 'test';
    const token = await jwtToken(userCode, '2h');
    const user = await userFetcher.fetch(`Bearer ${token}`);
    expect(user).toBeDefined();
    expect(user.code).toEqual(userCode);
    expect(user.token).toEqual(token);
  });

  test('should throw if token is expired', async () => {
    const userFetcher = new JwtUserFetcher(secretKey, issuer);
    const userCode = 'test';
    const token = await jwtToken(userCode, -1);
    expect(userFetcher.fetch(`Bearer ${token}`)).rejects.toMatch(userFetcher.userNotFoundMessage);
  });

  test('should throw if issuer not match', async () => {
    const userFetcher = new JwtUserFetcher(secretKey, issuer);
    const userCode = 'test';
    const token = await jwtToken(userCode, '2h', 'other-issuer');
    expect(userFetcher.fetch(`Bearer ${token}`)).rejects.toMatch(userFetcher.userNotFoundMessage);
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
