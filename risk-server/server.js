

'use strict';

const { GameEngine, Player } = require('../risk-game');
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

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

server.listen(PORT, () => console.log("Listening on port ${PORT}"));

//[Source: https://toxigon.com/create-multiplayer-game-with-socketio-and-react]