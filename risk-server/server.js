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
let duration = 40000;
let socketToPlayerMap = {};
function sortTime(){
    //Clear previous timeout
    if (timeout){
        clearTimeout(timeout)
    } 

    //emit current time with game state
    turnEndTime = Date.now() + duration;
      io.emit("game-state", { ...engine.serialise(), turnEndTime });

    //Call bot move if applicable
    const currentPlayer = engine.getCurrentPlayer();
    if (currentPlayer && currentPlayer.isBot) {
        setTimeout(botTurn, 1000); 
    }
    //Progress turn and recursively call function
    timeout = setTimeout(() => {
        engine.nextTurn();
        sortTime();
    }, duration);
}

let botRunning = false;

function botTurn(){
    //handle bot logic, return if game isnt running/bot is
    if (!playingGame || !engine || botRunning){
        
        return
    }
    botRunning = true
    try{
        //check for winner and clear state if so
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
        //get currnet player and phase
        const currentPlayer = engine.getCurrentPlayer()
        const phase = engine.getPhase()
        if (!currentPlayer || currentPlayer.isBot == false){
            botRunning = false
            return
        }
        if (phase == "Deploy"){
            //redeem cards if possible
            engine.redeemCards(currentPlayer);
            //get action from bot module
            const moves = Bot.chooseAction(engine, currentPlayer); 
            if (!moves){ 
                botRunning = false
                return;
            }
            //iterate deploy moves and apply via engine
            let remaining = currentPlayer.deployableTroops;
            for (const m of moves) {
                if (m.action === "nextPhase"){
                    engine.applyAction(m.action, m.payload);
                    io.emit("game-state", { ...engine.serialise(), turnEndTime });
                    console.log(`Bot deployed`);
                    break;
                }
                if (m.payload.amount <= 0 ){
                    continue;
                }
                let amount = Math.min(m.payload.amount, remaining);
                remaining -= amount;
                engine.applyAction(m.action, { ...m.payload, amount })
                console.log(`Bot deployed`);
            }
        }
        else {
            //Get action
            const m = Bot.chooseAction(engine, currentPlayer);
            if (!m) {
                botRunning = false
                return;
            }
            //Standardise
            let moveList = null
            if (Array.isArray(m)){
                moveList = m
            }
            else{
                moveList = [m]
            }
            //iterate moves and apply to engine
            for (const move of moveList){
                const result = engine.applyAction(move.action, move.payload);
                console.log(`Bot ${move.action}`, JSON.stringify(result));
                if (move.action === "attack") {
                    if (result?.result === true){
                        console.log(`Bot conquered territory! Moving ${result.troops} troops.`);
                        engine.applyAction("moveAfterAttack", {
                            sourceTerr: move.payload.territory,
                            moveTerr: move.payload.selectedTerritory,
                            amount: result.troops
                        });
                        io.emit("game-state", { ...engine.serialise(), turnEndTime });
                    }
                    else if (result?.result === false) {
                        console.log("Bot failed attack");
                    } else {
                        console.warn("Unexpected attack result:", result);
                        break
                    }
                    //serialise game 
                    io.emit("game-state", { ...engine.serialise(), turnEndTime });
                    sortTime();
                    botRunning = false;
                    return;
                }
                if (move.action === "nextPhase"){
                    console.log("Bot Next phase - ")
                    break;
                }
            }
        }
        //check game hasnt progressed because of aciton
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
        
        //emit state final time
        io.emit("game-state", { ...engine.serialise(), turnEndTime });
        botRunning = false
        setTimeout(botTurn, 1000);
        
    }   
    catch (err) {
        console.error("botTurn error:", err);
        sortTime();
    }
    finally{
        botRunning = false
    }

}

io.on("connection", (socket) => {
    console.log("Client connected", socket.id);
    //handle new players
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
        //check lobby is sufficient
        if (lobbyPlayers.length < 2){
            return;
        } 
        if (lobbyPlayers[0].socketId !== socket.id){
            return;
        } 
        //create players and engine
        const enginePlayers = lobbyPlayers.map((p, index) => 
            new Player(p.name, p.socketId, [], 0, 0, 0, 3, [], colours[index], false,p.isBot || false)
        );
        
        enginePlayers.forEach((p, i) => {
            socketToPlayerMap[p.id] = i;
        });
        
        engine = new GameEngine(enginePlayers, [], 0, 0); 
        //build map
        engine.createTerritories();
        engine.assignTerritories();
        engine.attemptLinks();
        engine.id = Math.random()
        console.log(engine.id)
        playingGame = true;
        //Start timer and emit state
        turnEndTime = Date.now() + duration;
        io.emit("game-start", { ...engine.serialise(), turnEndTime });
        sortTime()
    });

    socket.emit("lobby-update", lobbyPlayers);
    //used for initial state
    socket.on("request-initial-state", () => {
        if (engine) {
            socket.emit("game-state", { ...engine.serialise(), turnEndTime });
        } 
        else {
            console.log("no engine exists yet.");
            socket.emit("error", "No game in progress");
        }
    })
    //each player action 
    socket.on("player-action", ({ action, payload }, callback) => {
        if (!playingGame){
            socket.emit("error", "Game is not playing");
            return
        }
        try {
            //authenticate player move and handle any callbacks
            const currentPlayer = engine.players[engine.turn];
            const lobbyPlayer = lobbyPlayers.find(p => p.socketId === socket.id);
            if (!lobbyPlayer || lobbyPlayer.name !== currentPlayer.id) {
                console.log("improper")
                socket.emit("unuathorised move");
                return; 
            }
            let oldTurn = engine.turn; 

            console.log(`Human Action received: ${action}`);
            const result = engine.applyAction(action, payload);
            
            if (callback){
              callback(result);
            }
            //check for winner
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
        //Remove lost player from lobby and switch to bot
        if (!engine){
            return
        }
        let lostPlayer = engine.players.find(p => p.socketId === socket.id)
        if (!lostPlayer) {
            lobbyPlayers = lobbyPlayers.filter(p => p.socketId !== socket.id);
            console.log("cant find lost player")
            return;
        }
        lostPlayer.isBot = true
        io.emit("lobby-update", lobbyPlayers);
        //skip turn, prevent problems
        if (engine.getCurrentPlayer().socketId === socket.id) {
            if (timeout){ 
                clearTimeout(timeout);
            }
            engine.nextTurn();
            sortTime()
        }
    });

    socket.on("add-bot", () => {
        //add a bot with random name
        if (lobbyPlayers.length >= 6){
            return;
        }
        const random = Math.floor(Math.random() * 100)
        const botName = `Bot_${random}`;
        lobbyPlayers.push({ socketId: `bot_${random}`, name: botName, isBot: true });
        io.emit("lobby-update", lobbyPlayers);
    });

    socket.on("remove-bot", () => {
        //removes last bot added
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
