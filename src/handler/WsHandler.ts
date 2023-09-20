import { ServerWebSocket } from 'bun';
import { UserHandler } from './UserHandler';
import { MetricsHandler } from './MetricsHandler';
import { User, UserSocket } from '../model/types';
import { UserMessage } from '../model/UserMessage';

export class WsHandler {
  #userHandler: UserHandler<UserSocket>;
  #metricsHandler: MetricsHandler;

  constructor(userHandler: UserHandler<UserSocket>, metricsHandler: MetricsHandler) {
    this.#userHandler = userHandler;
    this.#metricsHandler = metricsHandler;
  }

  open(ws: ServerWebSocket<User>) {
    this.#userHandler.set(ws.data, ws);
    console.debug('====> User %s connected. Active connections: %i', ws.data.token, this.#userHandler.count());
    this.#metricsHandler.setConnectionsCount(this.#userHandler.count());
  }

  message(ws: ServerWebSocket<User>, message: string | Buffer) {
    console.debug('Message received from %s: %s', ws.data.token, message.toString());
    this.#metricsHandler.incrementMessagesCount();
    const timer = this.#metricsHandler.startTimer();
    try {
      const userMessage = UserMessage.parse(message.toString());
      const error = userMessage.validate();
      if (!error) {
        // valid message received
        const socket = this.#userHandler.get(userMessage.user!);
        if (!!socket) {
          // target user found
          socket!.send(new UserMessage({
            user: ws.data.token,
            message: userMessage.message,
          }).toString());
        } else {
          // target user not found
          ws.send(UserMessage.systemError('User not found!').toString());
        }
      } else {
        // invalid message received
        ws.send(UserMessage.systemError(error).toString());
      }
    } catch (e) {
      // message could not be parsed
      ws.send(UserMessage.systemError(e as string).toString());
      console.error(e);
    } finally {
      timer();
    }
  }

  close(ws: ServerWebSocket<User>) {
    this.#userHandler.delete(ws.data);
    console.debug('<- User %s disconnected. Active connections: %i', ws.data.token, this.#userHandler.count());
    this.#metricsHandler.setConnectionsCount(this.#userHandler.count());
  }
}
