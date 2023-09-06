import { check } from 'k6';
import ws from 'k6/ws';
import { randomString } from 'https://jslib.k6.io/k6-utils/1.1.0/index.js';
import { setTimeout } from 'k6/experimental/timers';

const baseUrl = 'ws://localhost:8080/websocket';

export const options = {
  vus: 1000,
  duration: '1m0s',
};

export default () => {
  const clientToken = randomString(8);
  const params = {
    headers: { 'authentication': clientToken },
  };
  const res = ws.connect(baseUrl, params, (socket) => {
    socket.on('open', () => {
      socket.send(JSON.stringify({ message: randomString(20) }));

      setTimeout(() => {
        socket.ping();
        socket.close();
      }, 1000);
    });
  });

  check(res, { 'status is 101': (r) => !!r && r.status === 101 });
};
