'use strict';

const http = require("http");
const { Server } = require("socket.io");
const { GameEngine, Player } = require("../risk-game");
const colours = ['red', 'green', 'yellow', 'pink', 'purple', 'orange']
const server = http.createServer();
const io = new Server(server, {
  cors: { origin: "*" }
});
let lobbyPlayers = []
let playingGame = false
let engine = null
let timeout = null
let turnEndTime = null
let duration = 30000;
let socketToPlayerMap = {};
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

io.on("connection", (socket) => {
    console.log("Client connected", socket.id);
    socket.on("player-joined", (name) => {
        if (playingGame){
            socket.emit("error", "Game in progress");
            return
        }
        if (lobbyPlayers.length >= 6) {
            socket.emit("error", "Lobby is full");
            return;
        }

        const newPlayer = { socketId: socket.id, name: name };
        lobbyPlayers.push(newPlayer);
        io.emit("lobby-update", lobbyPlayers);
    });

    socket.on("start-game", () => {
        if (lobbyPlayers.length < 2){
            return;
        } 
        if (lobbyPlayers[0].socketId !== socket.id){
            return;
        } 

        const enginePlayers = lobbyPlayers.map((p, index) => 
            new Player(p.name, [], 0, 0, 0, 3, [], colours[index], false)
        );
        
        
        enginePlayers.forEach((p, i) => {
            socketToPlayerMap[p.id] = i;
        });

        engine = new GameEngine(enginePlayers, [], 0, 0); 
        engine.createTerritories();
        engine.assignTerritories();
        engine.attemptLinks();
        engine.id = Math.random()
        console.log(engine.id)
        playingGame = true;
   
        turnEndTime = Date.now() + duration;
        io.emit("game-start", { ...engine.serialise(), turnEndTime });
        sortTime()
    });

    socket.emit("lobby-update", lobbyPlayers);


    socket.on("request-initial-state", () => {
        if (engine) {
            socket.emit("game-state", { ...engine.serialise(), turnEndTime });
        } 
        else {
            console.log("no engine exists yet.");
            socket.emit("error", "No game in progress");
        }
    })

    socket.on("player-action", ({ action, payload }, callback) => {
        if (!playingGame){
            socket.emit("error", "Game is not playing");
            return
        }
        try {
            const currentPlayer = engine.players[engine.turn];
            const lobbyPlayer = lobbyPlayers.find(p => p.socketId === socket.id);
            if (!lobbyPlayer || lobbyPlayer.name !== currentPlayer.id) {
                console.log("improper")
                socket.emit("unuathorised move");
                return; 
            }
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

    socket.on("disconnect", () => {
        lobbyPlayers = lobbyPlayers.filter(p => p.socketId !== socket.id);
        if (playingGame) {
            playingGame = false;
            io.emit("game-over", "Player disconnected");
        } else {
            io.emit("lobby-update", lobbyPlayers);
        }
    });
});

server.listen(5000, () => {
    console.log("Listening on port 5000");
});
