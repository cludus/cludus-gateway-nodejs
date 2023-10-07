import { User, UserFetcher } from '../model/types';
import { JwtPayload, verify as jwtVerify } from 'jsonwebtoken';

export class JwtUserFetcher implements UserFetcher {
  readonly secretKey: string;
  readonly issuer: string;
  readonly userNotFoundMessage: string;

  constructor(secretKey: string, issuer: string)
  constructor(secretKey: string, issuer: string, userNotFoundMessage?: string) {
    this.secretKey = secretKey;
    this.issuer = issuer;
    this.userNotFoundMessage = userNotFoundMessage || 'User not found!';
  }

  fetch(token: string): Promise<User> {
    return new Promise((resolve, reject) => {
      const tokenPrefix = 'Bearer ';
      let theToken = '';
      if (token.startsWith(tokenPrefix)) {
        theToken = token.substring(tokenPrefix.length);
      }
      try {
        const jwtPayload = jwtVerify(theToken, this.secretKey, {
          issuer: this.issuer,
          algorithms: ['HS256'],
        }) as JwtPayload;
        resolve({ code: jwtPayload.sub!, token: theToken });
      } catch (_) {
        reject(this.userNotFoundMessage);
      }
    });
  }
}
