import { decodeJwt, jwtVerify } from 'jose';
import { User, UserFetcher } from '../model/types';
import { dateInSecondsSinceEpochIsAfterToday } from '../util/date';

export class JwtUserFetcher implements UserFetcher {
  readonly secretKey: Uint8Array;
  readonly issuer: string;
  readonly userNotFoundMessage: string;

  constructor(secretKey: string, issuer: string)
  constructor(secretKey: string, issuer: string, userNotFoundMessage?: string) {
    this.secretKey = new TextEncoder().encode(secretKey);
    this.issuer = issuer;
    this.userNotFoundMessage = userNotFoundMessage || 'User not found!';
  }

  fetch(token: string): Promise<User> {
    return new Promise(async (resolve, reject) => {
      const tokenPrefix = 'Bearer ';
      let theToken = '';
      if (token.startsWith(tokenPrefix)) {
        theToken = token.substring(tokenPrefix.length);
      }
      try {
        const claims = decodeJwt(token);
        if (claims.sub && claims.iss == this.issuer && dateInSecondsSinceEpochIsAfterToday(claims.exp)) {
          resolve({ code: claims.sub!, token: theToken });
        } else {
          reject(this.userNotFoundMessage);
        }
      } catch (_) {
        reject(this.userNotFoundMessage);
      }
    });
  }
}
