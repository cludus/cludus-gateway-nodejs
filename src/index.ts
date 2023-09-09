import { WebSocket, WebSocketServer } from 'ws';
import 'dotenv/config';
import { UserHandler } from './UserHandler';
import { IncomingMessage } from 'http';

const port = Number.parseInt(process.env.WS_PORT || '') || 8080;
const path = process.env.WS_PATH || '/websocket';

const server = new WebSocketServer({
  port,
  path,
}, () => {
  console.log('Cludus Gateway webSocket server started on port %i with path %s', port, path);
});

const userHandler = new UserHandler({});
let messagesCount = 0;

server.on('connection', (socket: WebSocket, request: IncomingMessage) => {
  const clientToken = (request.headers['authentication'] || '') as string;
  if (userHandler.setSession(clientToken, socket)) {
    setupClient(clientToken, socket);
  } else {
    console.debug('Rejecting unknown client');
    socket.terminate();
  }
});

const setupClient = (clientToken: string, socket: WebSocket) => {
  console.debug('Client %s connected!', clientToken);
  showStats();
  socket.send('Welcome to Cludus');

  socket.on('message', (data) => {
    console.debug('Client %s message received: %s', clientToken, data);
    try {
      userHandler.deliverMessage(clientToken, socket, data.toString());
      messagesCount += 1;
      showStats();
    } catch (e) {
      console.error('UserHandler.deliverMessage', e);
      socket.send('Error processing message.');
    }
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
