import { WebSocketServer } from 'ws';

const server = new WebSocketServer({
  port: 8080,
  path: '/websocket',
});

server.on('connection', (socket, request) => {
  const clientToken = request.headers['authentication'];
  if (!clientToken) {
    socket.terminate();
  } else {
    setupClient(clientToken, socket);
  }
});

const clients = {};
const setupClient = (clientToken, socket) => {
  clients[clientToken] = socket;
  console.log('Client %s connected!', clientToken);

  socket.send('Welcome to Cludus');

  socket.on('message', (data) => {
    console.log('Client %s message received: %s', clientToken, data);
  });

  socket.on('close', () => {
    console.log('Client %s disconnected!', clientToken);
    clients[clientToken] = null;
  });
};
