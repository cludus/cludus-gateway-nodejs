import { WebSocketServer } from 'ws';
import 'dotenv/config';

const port = process.env.WS_PORT || 8080;
const path = process.env.WS_PATH || '/websocket';

const server = new WebSocketServer({
  port,
  path,
}, () => {
  console.log('Cludus Gateway webSocket server started on port %i with path %s', port, path);
});

server.on('connection', (socket, request) => {
  const clientToken = request.headers['authentication'];
  if (!!clientToken) {
    setupClient(clientToken, socket);
  } else {
    console.debug('Rejecting unknown client');
    socket.terminate();
  }
});

const clients = {};
const stats = {
  totalClients: 0,
  activeClients: 0,
  messages: 0,
};

const setupClient = (clientToken, socket) => {
  clients[clientToken] = socket;
  stats.totalClients += 1;
  stats.activeClients += 1;
  showStats();

  console.debug('Client %s connected!', clientToken);
  socket.send('Welcome to Cludus');

  socket.on('message', (data) => {
    console.debug('Client %s message received: %s', clientToken, data);
    socket.send(`Echo: ${data}`);
    stats.messages += 1;
    showStats();
  });

  socket.on('ping', () => {
    console.debug('Client %s ping', clientToken);
  });

  socket.on('close', () => {
    console.debug('Client %s disconnected!', clientToken);
    clients[clientToken] = null;
    stats.activeClients -= 1;
    showStats();
  });
};

const showStats = () => {
  console.debug('Active clients: %i, Total clients: %i, Messages: %i', stats.activeClients, stats.totalClients, stats.messages);
};
