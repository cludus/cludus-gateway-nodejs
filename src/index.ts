import { User } from './User';
import appConfig from './config';

// https://bun.sh/docs/api/websockets
Bun.serve<User>({
  fetch(req, server) {
    const url = new URL(req.url);
    if (url.pathname === appConfig.wsPath) {
      const userToken = req.headers.get('authentication');
      const success = server.upgrade(req, { data: { token: userToken } });
      return success
        ? undefined
        : new Response('WebSocket upgrade error', { status: 400 });
    }
    return new Response('Cludus Gateway!');
  },
  websocket: {
    open(ws) {
      const msg = `Welcome ${ws.data.token}!`;
      ws.send(msg);
    },
    message(ws, message) { }, // a message is received
    close(ws) { }, // a socket is closed
    perMessageDeflate: true,
  },
  port: appConfig.wsPort,
});
