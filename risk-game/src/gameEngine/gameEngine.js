import { MapGeneration } from '../mapGeneration/mapGeneration.js';
const Phases = ['Deploy', 'Attack', 'Reinforce']
const colours = ['red', 'green', 'yellow', 'pink', 'purple', 'orange']


class Player{
    constructor(id, socketId, territories = [], totalTroops, turnNumber, placedTroops, deployableTroops, cards = [], colour, recievedCard, isBot){
        this.id = id
        this.socketId = socketId
        this.territories = territories
        this.totalTroops = totalTroops
        this.turnNumber = turnNumber
        this.placedTroops = placedTroops
        this.deployableTroops = deployableTroops
        this.cards = cards
        this.colour = colour
        this.recievedCard = recievedCard
        this.isBot = isBot
        this.beat = false
    }
}

class Territory {
    static instances = [];
    constructor(row, col,id, troopCount = 0, owner= null, adjacent = [], isLink = false, linkDirection = null){
        this.id = id
        this.row = row
        this.col = col
        this.troopCount = troopCount
        this.owner = owner
        this.adjacent = adjacent
        this.isLink = isLink
        this.linkDirection = linkDirection
        Territory.instances.push(this)
    }
    
}

class Card{
    static idCount = 1;
    constructor(id, territoryID, type){
        this.id = id
        this.territoryID = territoryID
        this.type = type
    }
    static newCard(engine){
        const cardTypes = ['Soldier', 'Cavalry', 'Tank']
        const type = cardTypes[(Math.floor(Math.random() * 3))]
        let territoryID = engine.territories[(Math.floor(Math.random() * engine.territories.length))].id
        const id = Card.idCount++
        return new Card(id, territoryID, type)

    }
}

class GameEngine{
    constructor(players, territories, turn = 0, phaseNumber = 0 ){
        this.players = players
        this.territories = territories
        this.turn = turn
        this.phaseNumber = phaseNumber
        this.roundCount = 0;
        this.phases = ["Deploy", "Attack", "Reinforce"];
        this.winner = null,
        this.linkRoutes = []
    }

    applyAction(action, parameters = {}){
        switch (action){
            case "nextTurn":
                return this.nextTurn()
            case "getCurrentPlayer":
                return this.getCurrentPlayer()
            case "getPhase":
                return this.getPhase()
            case "redeemCards":
                return this.redeemCards(parameters.player);
            case "checkCards":
                return this.checkCards(parameters.player);
            case "findTerritory":
                return this.findTerritory(parameters.x,parameters.y)
            case "getPlayerByTerr":
                return this.getPlayerByTerr(parameters.id)
            case "attack":
                if (!parameters.player || !parameters.territory || !parameters.selectedTerritory) {
                    throw new Error("Invalid attack parameters");
                }   
                return this.attack(parameters.player, parameters.territory, parameters.selectedTerritory)
            case "getConnectingTerritories":
                const neighborsSet = this.getConnectingTerritories(parameters.x, parameters.y);
                return Array.from(neighborsSet);
            case "deploy":
                if (!parameters.player || !parameters.territory || parameters.amount <= 0) {
                    throw new Error("Invalid deploy parameters");
                } 
                return this.deploy(parameters.player, parameters.territory, parameters.amount)
            case "fortify":
                if (!parameters.player || !parameters.territory || !parameters.selectedTerritory || parameters.amount <= 0) {
                    throw new Error("Invalid fortify parameters");
                } 
                return this.fortify(parameters.player, parameters.territory, parameters.selectedTerritory, parameters.amount)
            case "moveAfterAttack":
                return this.moveAfterAttack(parameters.sourceTerr, parameters.moveTerr, parameters.amount)
            case "nextPhase":
                return this.nextPhase()
             default:
                throw new Error(`Unknown action: ${action}`);

        }
    }
    nextTurn(){
        console.log("Next turn executed, current turn:", this.turn);
        const playerCount = this.players.length;
        if (this.turn === playerCount - 1) {
            this.roundCount += 1;
        }
        let next = (this.turn + 1) % playerCount;
        let checked = 0;
        while (this.players[next].territories.length === 0){
            next = (next + 1) % playerCount;

            if (next === 0) {
                this.roundCount += 1;
            }
            checked++
            if (checked > playerCount){
                return this.turn;
            }
        }

        this.turn = next;

        const player = this.players[this.turn];
        player.recievedCard = false;
        this.phaseNumber = 0;
        player.deployableTroops = this.reinforcementValue(player);

        return this.turn;
    }

    checkWinner(){
        const owned = this.territories.filter(t => !t.isLink && t.owner !== null);
        if (owned.length == 0){
            return null
        }

        const owner = owned[0].owner;
        if (owner === null){
            return null;
        }

        for (const terr of owned){
            if (terr.owner !== owner){
                return null
            }
        }
        const winner = this.players.find(p => p.id === owner);
        return winner
    }

    getCurrentPlayer(){
        return this.players[this.turn]
    }

    getPhase(){
        return Phases[this.phaseNumber]
    }

    nextPhase(){
        this.phaseNumber = this.phaseNumber + 1;
        if (this.phaseNumber > 2){
            this.nextTurn()
            this.phaseNumber =0;
        }

        return this.getPhase()
    }

    deploy(playerD, territoryD, amount){
        const player = this.players.find(p => p.id === playerD.id);
        const territory = this.territories.find(t => t.id === territoryD.id);
        if (!player || !territory) {
            console.error("Deploy failed: Player or Territory not found in engine");
            return false;
        }
        let numAmount = Number(amount)
        if (territory.owner == player.id && !isNaN(numAmount)){
            territory.troopCount += numAmount
            player.placedTroops += numAmount
            player.deployableTroops -= numAmount;
            return true;
        }
        else{
            return { error: "INVALID_ATTACK_OWNED_TERRITORY" };
        }
    }

    attack(playerD, territoryD, selectedTerritoryD) {
        const player = this.players.find(p => p.id === playerD.id);
        const territory = this.territories.find(t => t.id === territoryD.id);
        const selectedTerritory = this.territories.find(t => t.id === selectedTerritoryD.id);
        if (!territory || !selectedTerritory){
             return;
        }

        if (territory.id === selectedTerritory.id || territory.owner === selectedTerritory.owner) {
            return { error: "INVALID_ATTACK_OWNED_TERRITORY" };
        }

        if (!this.checkAdjacency(territory, selectedTerritory, "Attack")) {
            return { error: "INVALID_ATTACK_NOT_ADJACENT" };
        }

        if (territory.troopCount <= 1){
            return;
        } 


        let ADice = territory.troopCount - 1;
        let DDice = selectedTerritory.troopCount;

        let AResults = [];
        let DResults = [];

        while (ADice > 0 && DDice > 0) {
            AResults = Array(Math.min(3, ADice))
                .fill(0)
                .map(() => Math.floor(Math.random() * 6) + 1);

            DResults = Array(Math.min(2, DDice))
                .fill(0)
                .map(() => Math.floor(Math.random() * 6) + 1);

            AResults.sort((a, b) => b - a);
            DResults.sort((a, b) => b - a);

            const rounds = Math.min(AResults.length, DResults.length);
            for (let i = 0; i < rounds; i++) {
                if (AResults[i] > DResults[i]) DDice--;
                else ADice--;
            }
        }

        territory.troopCount = ADice + 1;
        selectedTerritory.troopCount = DDice;

        if (DDice < 1) {
            

            selectedTerritory.troopCount = 1;
            territory.troopCount = ADice;

            if (!player.recievedCard) {
                const newCard = Card.newCard(this);
                player.cards.push(newCard);
                player.recievedCard = true;
                console.log("Card added:", newCard);
            }

            const oldOwnerId = selectedTerritory.owner;

            selectedTerritory.owner = territory.owner;

            const defender = this.players.find(p => p.id === oldOwnerId);
            if (defender) {
                defender.territories = defender.territories.filter(id => id !== selectedTerritory.id);
            }

            player.territories.push(selectedTerritory.id)
            if (defender.territories.length == 0){
                for (const card of defender.cards){
                    player.cards.push(card)
                    defender.cards = []
                    
                }
                defender.beat = true
            }
            const winner = this.checkWinner();
            if (winner != null){
                this.winner = winner
            }
            return {
                result: true,
                troops: Math.max(0, ADice - 1)
            };
        }

    }

    moveAfterAttack(sourceTerrD, moveTerrD, amount){
        const sourceTerr = this.territories.find(t => t.id === sourceTerrD.id);
        const moveTerr = this.territories.find(t => t.id === moveTerrD.id);
        sourceTerr.troopCount -= amount;
        moveTerr.troopCount += amount;
    }

    fortify(playerD, territoryD, selectedTerrD, amount){
        const player = this.players.find(p => p.id === playerD.id);
        const territory = this.territories.find(t => t.id === territoryD.id);
        const selectedTerritory = this.territories.find(t => t.id === selectedTerrD.id);
        const numAmount = Number(amount);
        if(this.checkAdjacency(territory,selectedTerritory, "Reinforce")){ 
            if(amount < territory.troopCount){
                if (selectedTerritory.owner == territory.owner){
                selectedTerritory.troopCount += numAmount
                territory.troopCount -= numAmount
                }
                else{
                    return { error: "INVALID_ATTACK_NOT_OWNED" };
                }
            }
            else{
                return { error: "INVALID_ATTACK_ONE_TROOP" };
            }
        
            
        }  
        else{
            return { error: "INVALID_ATTACK_NOT_ADJACENT" };
        }
    }

    checkAdjacency(territory, selectedTerritory, mode ){
        if (mode == "Attack"){
            if(territory.adjacent.includes(selectedTerritory.id) || (this.linkRoutes.some(
                ([a, b]) =>
                    (a === territory.id && b === selectedTerritory.id) ||
                    (a === selectedTerritory.id && b === territory.id)
            ))){
                return true
            }
            else {
                return false
            }
        }
        else{
            const connectingNeighbours = Array.from(this.getConnectingTerritories(territory.row, territory.col))
            if((connectingNeighbours.includes(selectedTerritory.id))){
                return true
            }
            else{ 
                return false
            }
        }
            
    }

    checkCards(player){
        let cardValues = 0;

        let soldierCount = 0;
        let cavalryCount = 0;
        let tankCount = 0;
        let checkOut = false;
        let bonus = false;
        let removeCards = []
        let inSoldier = 0
        let inTank = 0
        let inCav = 0
        for (let i = 0 ; i < player.cards.length; i++){
            let currentCard = player.cards[i]
            if (currentCard.type == "Soldier"){
                soldierCount += 1
            }
            else if (currentCard.type == "Cavalry"){
                cavalryCount += 1
            }
            else{
                tankCount += 1
            }
            if ((player.territories.includes(currentCard.territoryID)) && (bonus == false)){
                cardValues += 2;
                bonus = true
            }
        }
        if (soldierCount > 0 && cavalryCount > 0 && tankCount > 0){
            for (let j = 0 ; j < player.cards.length; j++){
                let innerCard = player.cards[j]
                if (innerCard.type == "Soldier" && inSoldier == 0){
                    inSoldier += 1
                    removeCards.push(innerCard)
                }
                else if(innerCard.type == "Tank" && inTank == 0){
                    removeCards.push(innerCard)
                    inTank += 1
                }
                else if( innerCard.type == "Cavalry" && inCav == 0){
                    removeCards.push(innerCard)
                    inCav += 1
                }
            }
            cardValues += 10
            soldierCount -= 1
            cavalryCount -= 1
            tankCount -= 1
            checkOut = true
        }
        else if (tankCount >= 3){
            for (let j = 0 ; j < player.cards.length; j++){
                let innerCard = player.cards[j]
                if (innerCard.type == "Tank" && inTank < 3){
                    inTank += 1
                    removeCards.push(innerCard)
                }
                
            }
            cardValues += 7
            tankCount -= 3
            checkOut = true
        }
        else if (cavalryCount >= 3){
            for (let j = 0 ; j < player.cards.length; j++){
                let innerCard = player.cards[j]
                if (innerCard.type == "Cavalry" && inCav < 3){
                    inCav += 1
                    removeCards.push(innerCard)
                }
                
            }
            cardValues += 5
            cavalryCount -= 3
            checkOut = true
        }
        else if (soldierCount >= 3){
            for (let j = 0 ; j < player.cards.length; j++){
                let innerCard = player.cards[j]
                if (innerCard.type == "Soldier" && inSoldier < 3){
                    inSoldier += 1
                    removeCards.push(innerCard)
                }
                
            }
            cardValues += 3
            soldierCount -= 3
            checkOut = true
        }
        return {checkOut, cardValues, removeCards}
    }

    redeemCards(playerD){
        const player = this.players.find(p => p.id === playerD.id);
        if (!player) return false;

        const {checkOut, cardValues, removeCards} = this.checkCards(player);
        if (checkOut === false){
            return false;
        }
        const removeIds = new Set(removeCards.map(c => c.id));
        player.cards = player.cards.filter(c => !removeIds.has(c.id));
        player.deployableTroops += cardValues;
        return true;
    }
    
    getNeighbours(x,y){
        //NOT FOR LINKS - need it for attacking etc
        let directions = [[1,0], [-1,0], [0,1], [0,-1],[1,1], [1,-1], [-1,1], [-1,-1]]
        const neighbours = []
        for (const [px, py] of directions){
            let rx = x + px
            let ry = y + py
            if (rx < 6 && ry < 6 && rx >= 0 && ry >= 0){
                neighbours.push(`${rx},${ry}`)
            }
        }
        return neighbours
    }

    reinforcementValue(player){
        if(this.roundCount == 0){
            return 3;
        }
        const terrCount = player.territories.length;
        if (terrCount <= 3) {
            return 3;
        }
        const terrTroops = Math.floor((terrCount - 3) / 4)
        return (3 + 2 * terrTroops)
    }
    
    initialiseGame(){
        console.log("initialiseGame CALLED");
        if (this._initialised == true){
            return
        }
        this._initialised = true
        this.assignColours()
        this.createTerritories()
        this.assignTerritories()
        this.attemptLinks()

    }

    assignColours(players){
        for ( let i = 0; i < this.players.length; i++ ){
            this.players[i].colour = colours[i]
        }
            
    }

    findTerritory(x, y){
        return this.territories.find(t => t.row === x && t.col === y)
    }
    getPlayerByTerr(id){
        return this.players.find(p => p.id == id)
    }

    serialise(){
        return {
            players: this.players,
            territories: this.territories,
            turn: this.turn,
            phaseNumber: this.phaseNumber,
            phases: this.phases,
            phase: this.phases[this.phaseNumber],
            winner: this.winner
        };
    }

    static deserialise(input){
        const players = input.players.map(p =>
        Object.assign(new Player(), p)
        );
        const engine = new GameEngine(
            players,
            input.territories,
            input.turn,
            input.phase
        );
        engine.winner = input.winner;

        return engine;
    }

    
}

Object.assign(GameEngine.prototype, MapGeneration);
export { Player, Territory,  Card, GameEngine };
 