import appConfig from './config';
import { User, UserSocket } from './types';
import { UserHandler } from './UserHandler';
import { UserMessage } from './UserMessage';
import { collectDefaultMetrics, Gauge, Registry } from 'prom-client';

const userHandler = new UserHandler<UserSocket>();
const promRegistry = new Registry();
collectDefaultMetrics({
  register: promRegistry,
  prefix: 'bun_',
  gcDurationBuckets: [0.001, 0.01, 0.1, 1, 2, 5],
});
const promGauge = new Gauge({
  name: 'gateway_bun_connections_gauge',
  help: 'Gateway connections gauge',
  labelNames: ['connections'],
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
      console.log('----> User %s connected. Active connections: %i', ws.data.token, userHandler.count());
      promGauge.labels('connections').set(userHandler.count());
    },
    message(ws, message) {
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
      }
    },
    close(ws) {
      userHandler.delete(ws.data);
      console.log('<- User %s disconnected. Active connections: %i', ws.data.token, userHandler.count());
      promGauge.labels('connections').set(userHandler.count());
    },
  },
});

console.log('Cludus Gateway server started on port %i with webSocket path: %s (Press CTRL+C to quit)',
  appConfig.serverPort, appConfig.wsPath);
