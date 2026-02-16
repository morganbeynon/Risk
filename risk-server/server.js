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

  console.log("Engine initialized. Sample State:", JSON.stringify(engine.serialise()).substring(0, 100));

  engine.__id = Math.random();
  console.log("ENGINE ID:", engine.__id);

setInterval(() => {
    engine.nextTurn();
    io.emit("game-state", engine.serialise());
}, 30000);

io.on("connection", (socket) => {
  console.log("Client connected", socket.id);

  // Send state immediately on connection
  socket.emit("game-state", engine.serialise());

  // ADD THIS: Listen for the manual request from your useEffect
  socket.on("request-initial-state", () => {
    console.log("Manual state request received from", socket.id);
    socket.emit("game-state", engine.serialise());
  });

  socket.on("player-action", ({ action, payload }, callback) => {
    try {
        console.log(`Action received: ${action}`);
        
        // 1. Apply the action to the engine
        const result = engine.applyAction(action, payload);
        
        // 2. If the client expects a callback (like in attack), return it
        if (callback) callback(result);

        // 3. CRITICAL: Broadcast the UPDATED engine state to ALL clients
        // This triggers the React useEffect to update the UI
        io.emit("game-state", engine.serialise());
        
    } catch (error) {
        console.error("Action error:", error);
    }
  });
});


server.listen(5000, () => {
  console.log("Listening on port 5000");
});
