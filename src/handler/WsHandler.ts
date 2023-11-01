import { UserHandler } from './UserHandler';
import { MetricsHandler } from './types';
import { User, UserMessageType } from '../model/types';
import { UserMessage } from '../model/UserMessage';
import { ServerMessage } from '../model/ServerMessage';
import WebSocket from 'ws';
import { IncomingMessage } from 'http';
import { LocalSocket } from '../model/socket';

export class WsHandler {
  readonly userHandler: UserHandler;
  readonly metricsHandler: MetricsHandler | null;

  constructor(userHandler: UserHandler, metricsHandler: MetricsHandler | null) {
    this.userHandler = userHandler;
    this.metricsHandler = metricsHandler;
  }

  async handle(socket: WebSocket, request: IncomingMessage) {
    const userToken = request.headers.authorization;
    try {
      const user = await this.userHandler.fetch(userToken || '');
      const localSocket = new LocalSocket(socket.url, socket);
      this.userHandler.set(user, localSocket);
      console.debug('====> User %s connected. Active connections: %d', user.code, this.userHandler.count());
      if (this.metricsHandler) {
        this.metricsHandler.setConnectionsCount(this.userHandler.count());
      }
      socket.on('message', (message) => this.message(user, socket, message));
      socket.on('close', () => this.close(user));
    } catch (_) {
      socket.close();
    }
  }

  message(user: User, socket: WebSocket, message: WebSocket.RawData) {
    console.debug('Message received from %s', user.code);
    this.userHandler.heartbeat(user);
    let timer = () => { };
    if (this.metricsHandler) {
      this.metricsHandler.incrementMessagesCount();
      timer = this.metricsHandler.startTimer();
    }
    try {
      const userMessage = UserMessage.parse(message.toString());
      const error = userMessage.validate();
      if (error) {
        // invalid message received
        socket.send(ServerMessage.error(userMessage.id!, error).toString());
      } else {
        // valid message received
        this._handleMessage(user, socket, userMessage);
      }
    } catch (e) {
      // message could not be parsed
      socket.send(ServerMessage.error('-', e as string).toString());
      console.error(e);
    } finally {
      timer();
    }
  }

  _handleMessage(user: User, socket: WebSocket, message: UserMessage) {
    if (message.action == UserMessageType.HEARTBEAT) {
      // hearbeat
      socket.send(ServerMessage.ack(message.id!).toString());
    } else {
      // recipient message
      this._handleRecipientMessage(user, socket, message);
    }
  }

  _handleRecipientMessage(user: User, socket: WebSocket, message: UserMessage) {
    const recipientSocket = this.userHandler.get(message.recipient!);
    if (recipientSocket) {
      // target user found
      recipientSocket!.send(ServerMessage.message(message.id!, user.code, message.content!).toString());
      // acknowledge message
      socket.send(ServerMessage.ack(message.id!).toString());
    } else {
      // target user not found
      socket.send(ServerMessage.error(message.id!, 'User not found!').toString());
    }
  }

  close(user: User) {
    this.userHandler.delete(user);
    console.debug('<- User %s disconnected. Active connections: %d', user.code, this.userHandler.count());
    if (this.metricsHandler) {
      this.metricsHandler.setConnectionsCount(this.userHandler.count());
    }
  }
}
