import { WebSocketServer } from 'ws';
import 'dotenv/config';
import { UserHandler } from './src/UserHandler.js';

const port = process.env.WS_PORT || 8080;
const path = process.env.WS_PATH || '/websocket';

const server = new WebSocketServer({
  port,
  path,
}, () => {
  console.log('Cludus Gateway webSocket server started on port %i with path %s', port, path);
});

const userHandler = new UserHandler();
let messagesCount = 0;

server.on('connection', (socket, request) => {
  const clientToken = request.headers['authentication'];
  if (userHandler.setSession(clientToken, socket)) {
    setupClient(clientToken, socket);
  } else {
    console.debug('Rejecting unknown client');
    socket.terminate();
  }
});

const setupClient = (clientToken, socket) => {
  console.debug('Client %s connected!', clientToken);
  showStats();
  socket.send('Welcome to Cludus');

  socket.on('message', (data) => {
    console.debug('Client %s message received: %s', clientToken, data);
    userHandler.deliverMessage(clientToken, socket, data);
    messagesCount += 1;
    showStats();
  });

  socket.on('close', () => {
    console.debug('Client %s disconnected!', clientToken);
    userHandler.removeSession(clientToken);
    showStats();
  });
};

const showStats = () => {
  const activeCount = userHandler.activeCount();
  console.debug('Active clients: %i, Total clients: %i, Messages: %i',
    activeCount, activeCount + userHandler.inactiveCount(), messagesCount);
};
