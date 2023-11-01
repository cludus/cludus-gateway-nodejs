import { RemoteHandler } from '../handler/types';
import { UserSocket } from './types';

export class RemoteSocket implements UserSocket {
  readonly url: string;
  readonly handler: RemoteHandler;

  constructor(url: string, handler: RemoteHandler) {
    this.url = url;
    this.handler = handler;
  }

  send(data: string): void {
    this.handler.sendRemote(this.url, data);
  }

  close(): void {
  }
}
