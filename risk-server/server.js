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
let timeout = null
let turnEndTime = null
let duration = 30000;


function sortTime(){
  if (timeout){
    clearTimeout(timeout)
  }


  turnEndTime = Date.now() + duration;

  io.emit("game-state", { ...engine.serialise(), turnEndTime });

  timeout = setTimeout(() => {
        engine.nextTurn();
        sortTime();
    }, duration);
}

turnEndTime = Date.now() + duration;
sortTime()

io.on("connection", (socket) => {
    console.log("Client connected", socket.id);

    socket.emit("game-state", { ...engine.serialise(), turnEndTime });

    socket.on("request-initial-state", () => {
        socket.emit("game-state", { ...engine.serialise(), turnEndTime });
    });

    socket.on("player-action", ({ action, payload }, callback) => {
        try {
            let oldTurn = engine.turn; 
            console.log(`Action received: ${action}`);
            const result = engine.applyAction(action, payload);
            
            if (callback){
              callback(result);
            }

            if (engine.turn !== oldTurn) {
                sortTime(); 
            } else {
                io.emit("game-state", { ...engine.serialise(), turnEndTime });
            }
            
        } catch (error) {
            console.error("Action error:", error);
        }
    });
});

server.listen(5000, () => {
    console.log("Listening on port 5000");
});
