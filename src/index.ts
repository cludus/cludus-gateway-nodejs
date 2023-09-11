import appConfig from './config';
import { User } from './types';
import { UserHandler } from './user_handler';

const userHandler = new UserHandler();

Bun.serve<User>({
  port: appConfig.serverPort,
  async fetch(req, server) {
    const url = new URL(req.url);
    if (url.pathname === appConfig.wsPath) {
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
    }
    return new Response('Cludus Gateway!');
  },
  websocket: {
    open(ws) {
      userHandler.set(ws.data, ws);
    },
    message(ws, message) {
      console.debug('Message received from %s: %s', ws.data.token, message);
    },
    close(ws) {
      userHandler.delete(ws.data);
    },
    perMessageDeflate: true,
  },
});

console.log('Cludus Gateway server started on port %i with webSocket path: %s',
  appConfig.serverPort, appConfig.wsPath);
