'use strict';

const http = require("http");
const { Server } = require("socket.io");
const { GameEngine, Player } = require("../risk-game");

const server = http.createServer();
const io = new Server(server, {
  cors: { origin: "*" }
});

io.on("connection", (socket) => {
  console.log("Client connected", socket.id);

  const players = [
    new Player("Player 1", [], 0, 0, [], 0, 3, [], "red", false),
    new Player("Player 2", [], 0, 0, [], 0, 3, [], "green", false),
  ];

  const engine = new GameEngine(players, [], [], 0, 0);
  engine.createTerritories();
  engine.assignTerritories();
  engine.attemptLinks();

  socket.emit("game-state", engine.serialise());
});

server.listen(5000, () => {
  console.log("Listening on port 5000");
});
