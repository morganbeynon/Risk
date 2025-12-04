
const Phases = ['Deploy', 'Attack', 'Reinforce']
const colours = ['red', 'green', 'yellow', 'pink', 'purple', 'orange']

class Player{
    constructor(id, territories = [], totalTroops, turnNumber, continents, placedTroops, deployableTroops, cards = [], colour){
        this.id = id
        this.territories = territories
        this.totalTroops = totalTroops
        this.turnNumber = turnNumber
        this.continents = continents
        this.placedTroops = placedTroops
        this.deployableTroops = deployableTroops
        this.cards = cards
        this.colour = colour
    }
}

class Territory {
    static instances = [];
    constructor(row, col,id, troopCount = 0, owner= null, adjacent = [], continent = null, isLink, linkDirection = null){
        this.id = id
        this.row = row
        this.col = col
        this.troopCount = troopCount
        this.owner = owner
        this.adjacent = adjacent
        this.continent = continent
        this.isLink = isLink
        this.linkDirection = linkDirection
        Territory.instances.push(this)
    }
    
}

class Continent{ 
    static instances = [];
    constructor(id, territories = []){
        this.id  = id
        this.territories= territories
        this.value = this.calculateValue();
        Continent.instances.push(this)

    } 

    calculateValue(){
        const length = this.territories.length;
        let value
        if (length < 5){
            return 2;
        }
        else if (length > 5 && length < 8){
            return 3;
        }
        else{
            return 5;
        }

}
}

class Card{
    static idCount = 1;
    constructor(id, owner, territoryID, type){
        this.id = id
        this.owner = owner
        this.territoryID = territoryID
        this.type = type
    }
    static newCard(engine){
        const cardTypes = ['Soldier', 'Cavalry', 'Tank']
        const type = cardTypes[(Math.floor(Math.random() * 3))]
        let territoryID = engine.territories[(Math.floor(Math.random() * engine.territories.length))].id
        const owner = engine.getCurrentPlayer().id
        const id = Card.idCount++
        return new Card(id, owner, territoryID, type)

    }
}

export const gameState = {
    players : [],
    territories : [],
    continents : [],
    turn : 0,
    phase : 'Deploy',

};

class GameEngine{
    constructor(players, territories, continent, turn, phaseNumber ){
        this.players = players
        this.territories = territories
        this.continents = continent
        this.turn = 0;
        this.phaseNumber = 0;
    }

    nextTurn(){
        this.turn = (this.turn + 1) % this.players.length
        this.phaseNumber = 0
        let player = this.players[this.turn];
        player.deployableTroops = this.reinforcementValue(player)
        return this.turn
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

    deploy(player, territory, amount){
        let numAmount = Number(amount)
        if (territory.owner == player.id && !isNaN(numAmount)){
            territory.troopCount += numAmount
            player.placedTroops += numAmount
            player.deployableTroops -= numAmount;
            return true;
        }
        else{
            alert("You can only deploy to owned territories")
            return false;
        }
    }

attack(player, territory, selectedTerritory ){
     if(territory.adjacent.includes(selectedTerritory.id) && selectedTerritory.id != territory.id){ 
        let ADice = territory.troopCount - 1 
        let DDice = selectedTerritory.troopCount 
        let AResults = [] 
        let DResults = [] 
        let cardTypes = ['Soldier', 'Cavalry', 'Tank'] 
        while(ADice > 0 && DDice > 0){ 
            //Generates Attacking dice results for 1 round 
            if(ADice > 2){ 
                AResults = [(Math.floor(Math.random() * 6) +1),(Math.floor(Math.random() * 6) +1),(Math.floor(Math.random() * 6) +1)] 
            } 
            else if(ADice == 2){ 
                AResults = [(Math.floor(Math.random() * 6) +1),(Math.floor(Math.random() * 6) +1)] 
            } 
            else{ 
                AResults = [(Math.floor(Math.random() * 6) +1)] } 
                //Generates Defending dice results for 1 round 
            if(DDice > 1){ 
                DResults = [(Math.floor(Math.random() * 6) +1),(Math.floor(Math.random() * 6) +1)] 
            } 
            else{
                DResults = [(Math.floor(Math.random() * 6) +1)] 
            }
            //Sorts result arrays numerically 
            AResults.sort((a, b) => b - a) 
            DResults.sort((a, b) => b - a) 
            //Compare highest against highest and second highest against second highest values in both results array. Whoever is lower, loses a troop 
            if (DResults.length > 1){ 
                if(AResults[0] > DResults[0]){ 
                    DDice -= 1
                } 
                else{ 
                    ADice -= 1 
                } 
                if(AResults[1] > DResults[1]){
                    DDice -= 1 
                }
                else{ 
                    ADice -= 1 
                } 
            } 
            else{ 
                if(AResults[0] > DResults[0]){
                    DDice -= 1 
                } 
                else{ 
                    ADice -= 1 
                } 
            } 
        } 
        if (DDice < 1){ 
            const newCard = Card.newCard(this);
            this.getCurrentPlayer().cards.push(newCard);
            const result = true 
            const troops = ADice 
            return {result, troops} 
        } 
        else{ 
            territory.troopCount = 1 
            selectedTerritory.troopCount = DDice 
            const result = false 
            const troops = 0 
            return {result, troops} 
        } 
    } 
    else(alert("Must attack an adjacent enemy territory"))
}
    fortify(player, territory, selectedTerritory, amount){
        const connectingNeighbours = Array.from(this.getConnectingTerritories(territory.row, territory.col))
        if(connectingNeighbours.includes(selectedTerritory.id)){
            if(amount < territory.troopCount){
                if (selectedTerritory.owner == territory.owner){
                selectedTerritory.troopCount += amount
                territory.troopCount -= amount
                }
                else{
                    alert("Must fortify to an owned territory")
                }
            }
            else{
                alert("You must leave 1 troop behind")
            }
        
            
        }  
        else{alert("Must fortify to an adjacent territory")}
    }

    checkCards(player, card, territory){
        //Write code to show cards in UI
        let cardValues = 0;
        let extraCards = [];
        let soldierCount = 0;
        let cavalryCount = 0;
        let tankCount = 0;
        let checkOut = false;

        for (let i = 0 ; i < player.cards.length; i++){
            let currentCard = player.cards[i]
            
            if (player.territories.includes(currentCard.territoryID)){
                cardValues += 2;
                //CODE HERE display on ui that +2 is added
                extraCards.push(currentCard.territoryID)
                if (currentCard.value == 'Soldier'){
                    soldierCount += 1
                }
                else if (currentCard.value == 'Cavalry'){
                    cavalryCount += 1
                }
                else{
                    tankCount += 1
                }
            }
        }
        if (soldierCount > 0 && cavalryCount > 0 && tankCount > 0){
            cardValues += 10
            soldierCount -= 1
            cavalryCount -= 1
            tankCount -= 1
            checkOut = true
        }
        else if (tankCount >= 3){
            cardValues += 7
            tankCount -= 3
            checkOut = true
        }
        else if (cavalryCount >= 3){
            cardValues += 5
            cavalryCount -= 3
            checkOut = true
        }
        else if (soldierCount >= 3){
            cardValues += 3
            soldierCount -= 3
            checkOut = true
        }

        if (checkOut == true){
            // code to enable checkout
        }
    }

    runPhases(){
        const currentPlayer = this.getCurrentPlayer()
        const phase = this.getPhase()

        if (phase == 'Deploy'){
            //Deploy UI code here 
            deployableTroops += this.reinforcementValue(this.player)
            this.nextPhase()
        }
        else if (phase == 'Attack'){
            //Attack UI Code hhere
            this.nextPhase()
        }
        else if (phase == 'Reinforce'){
            //Reinforce UI CODE HERE 
            this.nextTurn()
        }
    }
    
    getNeighbours(x,y){
        let directions = [[-1, 0],[1,0],[0,-1],[0,1], [1,-1],[-1,1],[1,1],[-1,-1]]
        const neighbours = []
        for (const [px, py] of directions){
            let rx = x + px
            let ry = y + py
            if (rx < 15 && ry < 15 && rx >= 0 && ry >= 0){
                neighbours.push(`${rx},${ry}`)
            }
        }
        return neighbours
    }

    //Link Functions 
    getConnectingTerritories(x,y){
        let connectingNeighbours = new Set([`${x},${y}`]);
        let visited = new Set();
        let neighbours = this.recursiveTerritoryChecker(x,y,connectingNeighbours,visited)

        return neighbours
    }

    recursiveTerritoryChecker(x,y,connectingNeighbours, visited){
        let initialNeighbours = this.getNeighbours(x,y)
        let id = `${x},${y}`
        visited.add(id)
        for (let i = 0; i < initialNeighbours.length; i++){
            let currentNeighbour = initialNeighbours[i]
            if (!visited.has(currentNeighbour)){
                if (this.getCurrentPlayer().territories.includes(currentNeighbour)){
                    connectingNeighbours.add(currentNeighbour)
                    const [nx, ny] = currentNeighbour.split(',').map(Number);
                    this.recursiveTerritoryChecker(nx,ny, connectingNeighbours, visited);
                }
            }
            
        }

        return connectingNeighbours
    }

    findGroup(startID){
        const visited = new Set();
        const stack = [startID];
        while (stack.length > 0){
            const id = stack.pop();
            if (!visited.has(id)){
                visited.add(id)
                const terr = this.territories.find(t => t.id == id)
                for (const adj of terr.adjacent){
                    if (!visited.has(adj)){
                        stack.push(adj)
                    }
                }
            }
        }
        return visited
    }

    findAllGroups(){
        const groups = [];
        const visitedTotal = new Set();

        for (const terr of this.territories){
            const id = terr.id
            if (!visitedTotal.has(id)){
                const group = this.findGroup(id)
                groups.push(group)
                for (const terr in group){
                    visitedTotal.add(terr)
                }
            }
        }
        return groups
    }

    findDisconnectedTerritories(){
        let groups = this.findAllGroups()
        let disconnected = []
        let isDisconnected = false
        if (groups.length > 1){
            disconnected = groups
            isDisconnected = true
        }
        return {isDisconnected, disconnected}
    }
    
    manhattanDistance(terrA, terrB) {
        return Math.abs(terrA.row - terrB.row) + Math.abs(terrA.col - terrB.col);
    }

    calcDistance(linkNum,group1, group2){
        const minDistA = Array(linkNum).fill(Number.MAX_VALUE)
        let pairs = Array(linkNum).fill(null)
        for (const terr1 of group1){
            const territory1 = this.territories.find(t1 => t1.id == terr1)
            for (const terr2 of group2){
                const territory2 = this.territories.find(t2 => t2.id == terr2)
                let distance = this.manhattanDistance(territory1, territory2)
                let pair = [territory1.id, territory2.id]
                for (let i = 0; i < minDistA.length; i++){
                    if (distance < minDistA[i]){
                        for (let j = linkNum - 1; j > i; j--) {
                            minDistA[j] = minDistA[j - 1];
                            pairs[j] = pairs[j - 1];
                        }
                        minDistA[i] = distance
                        pairs[i] = pair
                        break
                    }
                }
            }
        }
        return pairs
    }

    linkRouteCalc(link){
        const start = link[0]
        const end = link[1]
        const route = [start]
        let [x, y] = start.split(",").map(Number)
        let [endX, endY] = end.split(",").map(Number)
  
        while (x !== endX || y !== endY){
            if (x < endX){
                x += 1
            }
            else if(x > endX){
                x -= 1
            }
            if(y < endY){
                y += 1
            }
            else if(y > endY){
                y -= 1
            }
            let id = `${x},${y}`
            route.push(id)
        }
        return route
    }

    addLinkDirection(route){
        for (let i = 0; i < route.length-1; i++){
            let [currX, currY] = route[i].split(",").map(Number)
            let [nextX, nextY] = route[i+1].split(",").map(Number)
            let direction = ""

            if (currX == nextX && currY != nextY){
                direction = "Vertical"
            }
            else if(currX != nextX && currY == nextY){
                direction = "Horizontal"
            }
            else{
                direction = "Diagonal"
            }
            route[i] = `${currX},${currY},${direction}`
        }
        return route
    }

    calcLinks(){
        let results = this.findDisconnectedTerritories()
        const {isDisconnected, disconnected} = results
        const links = []
        if(isDisconnected){
            const linkNum = Math.round(disconnected.length * Math.random() * 2)
            const numGroups = disconnected.length
            const linkPerGroup = linkNum/numGroups
            
            for (let i = 0; i < numGroups; i++){
                for (let j = i + 1; j < numGroups; j++){
                        const result = this.calcDistance(linkPerGroup,disconnected[i], disconnected[j])
                        links.push(result)
                }
            }
            let routes = []
            for (const link of links){
                let route = this.linkRouteCalc(link)
                let adjustedRoute = this.addLinkDirection(route)
                links.push(adjustedRoute)
            }
        }
        return links
    }


    

    createTerritories(){
        this.territories = []
        for (let row = 0; row < 15; row++){
           for( let col = 0; col < 15; col++){
                
                    const neighbours = this.getNeighbours(row,col)
                    const id = `${row},${col}`
                    const territory = new Territory( row,col, id, 0, null, neighbours, null, false, null)
                    this.territories.push(territory)

            } 
        }
        let links = this.calcLinks()
        for (const link of links ){
            let [lX,lY, direction] = link.split(",").map(Number)
            const currTerritory = findTerritory(lX,lY);
            currTerritory.direction = direction

        }


    }
        
    assignTerritories(){
        const shuffledTerritories = [...this.territories].sort(() => Math.random() - 0.5)
        for (let i = 0; i < shuffledTerritories.length; i++){
            const makeCheck = Math.round(Math.random()) * 3
            if (makeCheck < 1/3){
                const currentPlayer = this.players[i % this.players.length]
                const currentTerritory = shuffledTerritories[i]
                currentTerritory.owner = currentPlayer.id
                currentTerritory.troopCount = 1
                currentPlayer.territories.push(currentTerritory.id)
            }
        }
    }

    continentValueCheck(player){
        let continentValue = 0;
        for (const continent of Continent.instances){
            if (continent.territories.every(t => player.territories.includes(t))) {
            continentValue += continent.value;
            }
        }
        return continentValue
    }
    reinforcementValue(player){
        let reTroopCount = 3
        let terrLen = player.territories.length
        if (terrLen > 6){
            terrLen -= 6
            reTroopCount = Math.floor(terrLen / 3)
        }
        
        //let continentBonus = this.continentValueCheck(player)
        //reTroopCount += continentBonus

        return reTroopCount
    }
    
    initialiseGame(){
        //NEED GAME GEN
        this.assignColours()
        this.assignTerritories()

    }

    assignColours(players){
        for ( let i = 0; i < this.players.length; i++ ){
            this.players[i].colour = colours[i]
        }
            
    }

    findTerritory = (x, y) => {
        return mapData.find(t => t.row === x && t.col === y)
    }
    getTerritoryPlayer = (id) => {
        return engine.players.find(p => p.id == id)
    }
    //TO ADD
    //REDEEM CARDS - NEED UI
    // TERRITORIES - NEED MAP GEN

}
export { Player, Territory, Continent, Card, GameEngine };
