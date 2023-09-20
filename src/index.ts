import appConfig from './config';
import { User, UserSocket } from './types';
import { UserHandler } from './UserHandler';
import { UserMessage } from './UserMessage';
import { Counter, Histogram, Gauge, Registry } from 'prom-client';

const userHandler = new UserHandler<UserSocket>();
const promRegistry = new Registry();
const promConnsCounter = new Gauge({
  name: 'cludus_gateway_connections_count',
  help: 'Cludus Gateway Connections count Gauge',
  registers: [promRegistry],
});
const promMsgsCounter = new Counter({
  name: 'cludus_gateway_messages_count',
  help: 'Cludus Gateway Messages Counter',
  registers: [promRegistry],
});
const promMsgsTimer = new Histogram({
  name: 'cludus_gateway_messages_latency',
  help: 'Cludus Gateway Messages Latency Histogram',
  registers: [promRegistry],
});

Bun.serve<User>({
  port: appConfig.serverPort,
  async fetch(req, server) {
    const url = new URL(req.url);
    if (url.pathname === appConfig.wsPath) {
      // websocket request
      const userToken = req.headers.get('authentication');
      try {
        const user = await userHandler.fetch(userToken || '');
        const success = server.upgrade(req, { data: user });
        return success
          ? undefined
          : new Response('WebSocket upgrade error', { status: 400 });
      } catch (e) {
        return new Response(e as string | undefined, { status: 401 });
      }
    } else if (url.pathname === appConfig.prometheusPath) {
      const metrics = await promRegistry.metrics();
      return new Response(metrics, {
        headers: {
          'Content-Type': promRegistry.contentType,
        },
      });
    }
    return new Response('Cludus Gateway!');
  },
  websocket: {
    open(ws) {
      userHandler.set(ws.data, ws);
      console.debug('====> User %s connected. Active connections: %i', ws.data.token, userHandler.count());
      promConnsCounter.set(userHandler.count());
    },
    message(ws, message) {
      promMsgsCounter.inc();
      const promTimer = promMsgsTimer.startTimer();
      try {
        const userMessage = UserMessage.parse(message.toString());
        const error = userMessage.validate();
        if (!error) {
          // valid message received
          const socket = userHandler.get(userMessage.user!);
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
        promTimer();
      }
    },
    close(ws) {
      userHandler.delete(ws.data);
      console.debug('<- User %s disconnected. Active connections: %i', ws.data.token, userHandler.count());
      promConnsCounter.set(userHandler.count());
    },
  },
});

const devTip = appConfig.devMode ? '(Press CTRL+C to quit)' : ''
console.log('Cludus Gateway server started on port %i %s', appConfig.serverPort, devTip);
console.log(' - WebSocket endpoint : %s', appConfig.wsPath);
console.log(' - Prometheus endpoint: %s', appConfig.prometheusPath);
