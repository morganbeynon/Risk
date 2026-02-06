

'use strict';

const { GameEngine, Player } = require('../risk-game');
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const players = [
  new Player("Player 1", [], 0, 0, [], 0, 3, [], "red", false),
  new Player("Player 2", [], 0, 0, [], 0, 3, [], "green", false),
  new Player("Player 3", [], 0, 0, [], 0, 3, [], "gold", false),
  new Player("Player 4", [], 0, 0, [], 0, 3, [], "pink", false),
];

const engine = new GameEngine(players, [], [], 0, 0);
engine.createTerritories();
engine.assignTerritories();
engine.attemptLinks();


const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'client/build')));

// Put all API endpoints under '/api' endpoint
app.get('/api/*', (req, res) => {
 res.json({ message: 'Hello from the server!' });
});

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
 res.sendFile(path.join(__dirname + '/client/build/index.html'));
});

io.on('connection', (socket) => {
  console.log('New client connected');

  socket.emit('game-state', engine.serialize());

  socket.on('player-action', ({ action, payload }) => {
    try {
      engine.applyAction(action, payload);
      io.emit('game-state', engine.serialize());
    } catch (err) {
      console.error('Action failed:', err);
      socket.emit('error', { message: err.message });
    }
  });

  socket.on('disconnect', () => console.log('Client disconnected'));
});


const PORT = process.env.PORT || 5000;

server.listen(PORT, () => console.log("Listening on port", ${PORT}));

// Socket.IO events
io.on('connection', (socket) => {
 console.log('New client connected');

 socket.on('disconnect', () => {
 console.log('Client disconnected');
 });

 socket.on('move', (data) => {
 // Broadcast the move to all other clients
 socket.broadcast.emit('move', data);
 });
});
//[Source: https://toxigon.com/create-multiplayer-game-with-socketio-and-react]