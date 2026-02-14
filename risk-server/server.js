'use strict';

const http = require("http");
const { Server } = require("socket.io");
const { GameEngine, Player } = require("../risk-game");

const server = http.createServer();
const io = new Server(server, {
  cors: { origin: "*" }
});

const players = [
    new Player("Player 1", [], 0, 0, 0, 3, [], "red", false),
    new Player("Player 2", [], 0, 0, 0, 3, [], "green", false),
];




  const engine = new GameEngine(players, [], 0, 0);
  engine.createTerritories();
  engine.assignTerritories();
  engine.attemptLinks();

  engine.__id = Math.random();
  console.log("ENGINE ID:", engine.__id);

setInterval(() => {
    engine.nextTurn();
    io.emit("game-state", engine.serialise());
}, 20000);

io.on("connection", (socket) => {
  console.log("Client connected", socket.id);

  socket.emit("game-state", engine.serialise());

  socket.on("disconnect", () => {
    console.log("Client disconnected", socket.id);
  });

  socket.on("player-action", ({ action, payload }, callback) => {
    const result = engine.applyAction(action, payload);
    if (callback){
      callback(result);
    }
    io.emit("game-state", engine.serialise());
  });

});


server.listen(5000, () => {
  console.log("Listening on port 5000");
});
