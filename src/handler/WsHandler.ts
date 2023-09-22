import { ServerWebSocket } from 'bun';
import { UserHandler } from './UserHandler';
import { MetricsHandler } from './types';
import { User, UserMessageType } from '../model/types';
import { UserMessage } from '../model/UserMessage';
import { ServerMessage } from '../model/ServerMessage';

export class WsHandler {
  #userHandler: UserHandler;
  #metricsHandler: MetricsHandler;

  constructor(userHandler: UserHandler, metricsHandler: MetricsHandler) {
    this.#userHandler = userHandler;
    this.#metricsHandler = metricsHandler;
  }

  open(ws: ServerWebSocket<User>) {
    this.#userHandler.set(ws.data, ws);
    console.debug('====> User %s connected. Active connections: %d', ws.data.token, this.#userHandler.count());
    this.#metricsHandler.setConnectionsCount(this.#userHandler.count());
  }

  message(ws: ServerWebSocket<User>, message: string | Buffer) {
    console.debug('Message received from %s: %s', ws.data.token, message.toString());
    this.#metricsHandler.incrementMessagesCount();
    const timer = this.#metricsHandler.startTimer();
    try {
      const userMessage = UserMessage.parse(message.toString());
      const error = userMessage.validate();
      if (!!error) {
        // invalid message received
        ws.send(ServerMessage.error(error).toString());
      } else {
        // valid message received
        this._handleMessage(ws, userMessage);
      }
    } catch (e) {
      // message could not be parsed
      ws.send(ServerMessage.error(e as string).toString());
      console.error(e);
    } finally {
      timer();
    }
  }

  _handleMessage(ws: ServerWebSocket<User>, message: UserMessage) {
    this.#userHandler.heartbeat(ws.data);
    if (message.action == UserMessageType.HEARTBEAT) {
      // hearbeat
      ws.send(ServerMessage.ack().toString());
    } else {
      // recipient message
      this._handleRecipientMessage(ws, message);
    }
  }

  _handleRecipientMessage(ws: ServerWebSocket<User>, message: UserMessage) {
    const socket = this.#userHandler.get(message.recipient!);
    if (!!socket) {
      // target user found
      socket!.send(ServerMessage.message(ws.data.token, message.content!).toString());
      // acknowledge message
      ws.send(ServerMessage.ack().toString());
    } else {
      // target user not found
      ws.send(ServerMessage.error('User not found!').toString());
    }
  }

  close(ws: ServerWebSocket<User>) {
    this.#userHandler.delete(ws.data);
    console.debug('<- User %s disconnected. Active connections: %d', ws.data.token, this.#userHandler.count());
    this.#metricsHandler.setConnectionsCount(this.#userHandler.count());
  }
}
