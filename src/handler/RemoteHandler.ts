import { RemoteHandler } from './types';

export class FakeRemoteHandler implements RemoteHandler {
  sendRemote(token: string, data: string): void {
    console.error('Cannot send remote messages, not configured!');
  }
}
