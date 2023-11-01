import { DiscoveryHandler, RemoteHandler } from './types';

export class GrpcRemoteHandler implements RemoteHandler {
  readonly discoveryHandler: DiscoveryHandler;

  constructor(discoveryHandler: DiscoveryHandler) {
    this.discoveryHandler = discoveryHandler;
  }

  sendRemote(token: string): Promise<void> {
    console.error(`Cannot send remote message to ${token}, not configured!`);
    throw new Error('Method not implemented.'); // TODO
  }
}

export class FakeRemoteHandler implements RemoteHandler {
  sendRemote(token: string): Promise<void> {
    console.error(`Cannot send remote message to ${token}, not configured!`);
    return Promise.reject();
  }
}
