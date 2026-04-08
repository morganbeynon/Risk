'use strict';

const http = require("http");
const { Server } = require("socket.io");
const { GameEngine, Player } = require("../risk-game");
const { Bot } = require("../risk-game/src/ai/bot");
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

  const currentPlayer = engine.getCurrentPlayer();
  if (currentPlayer && currentPlayer.isBot) {
      setTimeout(botTurn, 1000); 
  }

  timeout = setTimeout(() => {
        engine.nextTurn();
        sortTime();
    }, duration);
}

let botRunning = false;

function botTurn(){
    
    if (!playingGame || !engine || botRunning){
        
        return
    }
    botRunning = true
    
    const winner = engine.checkWinner();
    if (winner) {
        engine.winner = winner;
        const finalState = engine.serialise(); 
        playingGame = false;
        clearTimeout(timeout);
        timeout = null;
        io.emit("game-state", { ...finalState, turnEndTime });
        engine = null;
        lobbyPlayers = [];
        socketToPlayerMap = {};
        botRunning = false;
        return;
    }

    const currentPlayer = engine.getCurrentPlayer()
    const phase = engine.getPhase()
    if (!currentPlayer || currentPlayer.isBot == false){
        botRunning = false
        return
    }
    if (engine.getPhase() == "Deploy"){
        engine.redeemCards(currentPlayer);
        const moves = Bot.chooseAction(engine, currentPlayer); 
        if (!moves){ 
            botRunning = false
            return;
        }
        let remaining = currentPlayer.deployableTroops;
        for (const m of moves) {
            if (m.action === "nextPhase"){
                engine.applyAction(m.action, m.payload);
                console.log(`Bot deployed`);
                break;
            }
            if (m.payload.amount <= 0 ){
                continue;
            }
            let amount = Math.min(m.payload.amount, remaining);
            remaining -= amount;
            engine.applyAction(m.action, amount)
            console.log(`Bot deployed`);
        }
    }
    else {
        const m = Bot.chooseAction(engine, currentPlayer);
        if (!m) {
            botRunning = false
            return;
        }
        let moveList = null
        if (Array.isArray(m)){
            moveList = m
        }
        else{
            moveList = [m]
        }
        for (const move of moveList){
            const result = engine.applyAction(move.action, move.payload);
            console.log(`Bot ${move.action}`);
            if (move.action === "attack" && result?.result === true) {
                console.log(`Bot conquered territory! Moving ${result.troops} troops.`);
                engine.applyAction("moveAfterAttack", {
                    sourceTerr: move.payload.territory,
                    moveTerr: move.payload.selectedTerritory,
                    amount: result.troops
                });
            }
            if (move.action === "attack" && result?.result === false) {
                engine.applyAction("nextPhase", {});
                sortTime();
                botRunning = false;
                return;
            }

            if (move.action === "nextPhase"){
                break;
            }
        }
    }
    
   
    const nextPlayer = engine.getCurrentPlayer();
    const nextPhase = engine.getPhase()
    if (nextPlayer.id !== currentPlayer.id) {
        sortTime();
        botRunning = false 
        return;     
    }

    if (nextPhase !== phase) {
        sortTime();
        botRunning = false
        return
    }


    io.emit("game-state", { ...engine.serialise(), turnEndTime });
    setTimeout(botTurn, 1000);
    botRunning = false
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

        const existing = lobbyPlayers.findIndex(p => p.socketId === socket.id);
    if (existing !== -1) {
        lobbyPlayers[existing].name = name; 
    } else {
        lobbyPlayers.push({ socketId: socket.id, name });
    }
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
            new Player(p.name, p.socketId, [], 0, 0, 0, 3, [], colours[index], false,p.isBot || false)
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
            let bot = "Human"
            if (currentPlayer.isBot){
                bot = "Bot"
            }

            console.log(`${bot} Action received: ${action}`);
            const result = engine.applyAction(action, payload);
            
            if (callback){
              callback(result);
            }

            const winner = engine.checkWinner();
            if (winner) {
                engine.winner = winner;
                const finalState = engine.serialise();
                playingGame = false;
                clearTimeout(timeout);
                timeout = null;
                lobbyPlayers = [];
                socketToPlayerMap = {};
                engine = null;
                io.emit("game-state", { ...finalState, turnEndTime });
                return;
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
        if (!engine){
            return
        }
        if (engine.players.length < 3){

            if (timeout) {
                clearTimeout(timeout);
                timeout = null;
            }

            io.emit("game-ended", { 
                message: "Player disconnected. Insufficient players: stopping game"
            });

            playingGame = false;
            engine = null;
            socketToPlayerMap = {}
            return;
        }
        let lostPlayer = engine.players.find(p => p.socketId === socket.id)
        lobbyPlayers = lobbyPlayers.filter(p => p.socketId !== socket.id);
        if (!lostPlayer) {
            console.log("cant find lost player")
            return;
        }
        lostPlayer.territories = []
        io.emit("lobby-update", lobbyPlayers);
        if (engine.getCurrentPlayer().socketId === socket.id) {
            engine.nextTurn();
            sortTime()
        }
    });

    socket.on("add-bot", () => {
        if (lobbyPlayers.length >= 6){
            return;
        }
        const random = Math.floor(Math.random() * 100)
        const botName = `Bot_${random}`;
        lobbyPlayers.push({ socketId: `bot_${random}`, name: botName, isBot: true });
        io.emit("lobby-update", lobbyPlayers);
    });

    socket.on("remove-bot", () => {
        const lastBotIndex = lobbyPlayers.findLastIndex(player => player.isBot);
    if (lastBotIndex === -1){
        return;
    } 
    
    lobbyPlayers.splice(lastBotIndex, 1);
    io.emit("lobby-update", lobbyPlayers);
    });

});

server.listen(5000, () => {
    console.log("Listening on port 5000");
});
