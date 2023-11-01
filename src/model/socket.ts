import WebSocket from 'ws';
import { RemoteHandler } from '../handler/types';
import { UserSocket } from './types';

export class LocalSocket implements UserSocket {
  readonly url: string;
  readonly socket: WebSocket;

  constructor(url: string, socket: WebSocket) {
    this.url = url;
    this.socket = socket;
  }

  send(data: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      try {
        this.socket.send(data);
        resolve();
      } catch (e) {
        reject(e);
      }
    });
  }

  close(): void {
    this.socket.close;
  }
}

export class RemoteSocket implements UserSocket {
  readonly url: string;
  readonly handler: RemoteHandler;

  constructor(url: string, handler: RemoteHandler) {
    this.url = url;
    this.handler = handler;
  }

  send(data: string): Promise<void> {
    return this.handler.sendRemote(this.url, data);
  }

  close(): void {
  }
}
