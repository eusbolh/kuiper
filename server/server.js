const express = require('express');
const { ExpressPeerServer } = require('peer');
const cors = require('cors');
const cache = require('memory-cache');

require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize peers on cache
cache.put('peers', {})

const peersRouter = require('./routes/peers');
app.use('/peers', peersRouter)

const server = app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});

const peerServer = ExpressPeerServer(server, {
  debug: true,
  path: '/',
  generateClientId: () => (Math.random().toString(36) + '0000000000000000000').substr(2, 16),
});

app.use('/kuiper', peerServer);

// When a peer connects to the server
peerServer.on('connection', (client) => {
  // Log message
  console.log(`Client is connected with the ID: ${client.id}.`);

  // Update peers array
  const peers = cache.get('peers');
  peers[client.id] = true;
  cache.put('peers', peers);
});

// When a peer disconnects from the server
peerServer.on('disconnect', (client) => {
  // Update peers array
  const peers = cache.get('peers');
  delete peers[client.id];
  cache.put('peers', peers);

  // Log message
  console.log(`Client with the ID ${client.id} is disconnected.`);
});
