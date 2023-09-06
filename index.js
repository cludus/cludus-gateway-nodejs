import { WebSocketServer } from 'ws';
import 'dotenv/config';

const port = process.env.WS_PORT || 8080;
const path = process.env.WS_PATH || '/websocket';

const server = new WebSocketServer({
  port: port,
  path: path,
}, () => {
  console.log('Cludus Gateway webSocket server started on port %i with path %s', port, path);
});

server.on('connection', (socket, request) => {
  const clientToken = request.headers['authentication'];
  if (!!clientToken) {
    setupClient(clientToken, socket);
  } else {
    socket.terminate();
  }
});

const clients = {};
const setupClient = (clientToken, socket) => {
  clients[clientToken] = socket;
  console.debug('Client %s connected!', clientToken);

  socket.send('Welcome to Cludus');

  socket.on('message', (data) => {
    console.debug('Client %s message received: %s', clientToken, data);
    socket.send(`Echo: ${data}`);
  });

  socket.on('close', () => {
    console.debug('Client %s disconnected!', clientToken);
    clients[clientToken] = null;
  });
};
