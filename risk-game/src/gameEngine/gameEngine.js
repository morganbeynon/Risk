const Phases = ['Deploy', 'Attack', 'Reinforce']
const colours = ['red', 'green', 'yellow', 'pink', 'purple', 'orange']
let linkRoutes = []

class Player{
    constructor(id, territories = [], totalTroops, turnNumber, continents, placedTroops, deployableTroops, cards = [], colour, recievedCard){
        this.id = id
        this.territories = territories
        this.totalTroops = totalTroops
        this.turnNumber = turnNumber
        this.continents = continents
        this.placedTroops = placedTroops
        this.deployableTroops = deployableTroops
        this.cards = cards
        this.colour = colour
        this.recievedCard = recievedCard
    }
}

class Territory {
    static instances = [];
    constructor(row, col,id, troopCount = 0, owner= null, adjacent = [], continent = null, isLink = false, linkDirection = null){
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
        this.getCurrentPlayer().recievedCard = false
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
     if(this.checkAdjacency(territory,selectedTerritory, "Attack")){ 
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
            const currPlayer = this.getCurrentPlayer()
            if (!currPlayer.recievedCard){
                const newCard = Card.newCard(this);
                currPlayer.cards.push(newCard);
            }
            this.getCurrentPlayer().recievedCard = true
            console.log(currPlayer.cards.length)
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
    else(alert("You must attack an adjacent enemy territory"))
}
    fortify(player, territory, selectedTerritory, amount){
        if(this.checkAdjacency(territory,selectedTerritory, "Reinforce")){ 
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

    checkAdjacency(territory, selectedTerritory, mode ){
        if (mode == "Attack"){
            if(territory.adjacent.includes(selectedTerritory.id) || (linkRoutes.some(
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

    checkCards(player, card, territory){
        //Write code to show cards in UI
        let cardValues = 0;
        let extraCards = [];
        let soldierCount = 0;
        let cavalryCount = 0;
        let tankCount = 0;
        let checkOut = false;
        let bonus = false;

        for (let i = 0 ; i < player.cards.length; i++){
            let currentCard = player.cards[i]
            
                extraCards.push(currentCard.territoryID)
                if (currentCard.type == 'Soldier'){
                    soldierCount += 1
                }
                else if (currentCard.type == 'Cavalry'){
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
        for (let i = 0; i < initialNeighbours.length; i++) {
            const currentNeighbour = initialNeighbours[i]
            if (!visited.has(currentNeighbour)){

            const terr = this.territories.find(t => t.id === currentNeighbour)
            if (terr){

                if (
                    terr.owner === this.getCurrentPlayer().id ||
                    terr.isLink === true
                ) {
                    connectingNeighbours.add(currentNeighbour)
                    const [nx, ny] = currentNeighbour.split(',').map(Number)
                    this.recursiveTerritoryChecker(nx, ny, connectingNeighbours, visited)
                }
            }
            }
        }

        for (const [a, b] of linkRoutes) {
            if (!(a !== id && b !== id)){
                const linkedID = a === id ? b : a
            if (!visited.has(linkedID)){
                const terr = this.territories.find(t => t.id === linkedID)
                if (terr){
                    if (
                        terr.owner === this.getCurrentPlayer().id ||
                        terr.isLink === true
                    ) {
                        connectingNeighbours.add(linkedID)
                        const [lx, ly] = linkedID.split(',').map(Number)
                        this.recursiveTerritoryChecker(lx, ly, connectingNeighbours, visited)
                    }
                }
            }
        }
        }

        return connectingNeighbours
    }

    findGroup(startID){
        const visited = new Set();
        const startTerr = this.territories.find(t => t.id === startID)
        if (!startTerr || startTerr.owner === null){
            return new Set()
        }
        const stack = [startID];
        while (stack.length > 0){
            const id = stack.pop();
            if (!visited.has(id)){
                visited.add(id)
                const terr = this.territories.find(t => t.id == id)
                if (!terr){
                    continue;
                }
                for (const adj of terr.adjacent){
                    const adjTerr = this.territories.find(t => t.id === adj)
                    if (adjTerr &&  adjTerr.owner !== null && !visited.has(adj)){
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
            if (terr.owner !== null){
            const id = terr.id
            if (!visitedTotal.has(id)){
                const group = this.findGroup(id)
                groups.push(group)
                for (const terr of group){
                    visitedTotal.add(terr)
                }
            }
        }
    }
    console.log("GROUP SIZES:", groups.map(g => g.size))
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
        console.log(disconnected)
        return {isDisconnected, disconnected}
    }
    
    manhattanDistance(terrA, terrB) {
        return Math.abs(terrA.row - terrB.row) + Math.abs(terrA.col - terrB.col);
    }

    calcDistance(linkNum,group1, group2){
        if (!group1.size || !group2.size){
            return []
        }
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
        for (let i = 1; i < route.length-1; i++){
            let [currX, currY] = route[i].split(",").map(Number)
            let [nextX, nextY] = route[i+1].split(",").map(Number)
            let direction = ""

            if (currX == nextX && currY != nextY){
                direction = "Horizontal"
            }
            else if(currX != nextX && currY == nextY){
                direction = "Vertical"
            }
            else{
                if ((nextX > currX && nextY > currY) || (nextX < currX && nextY < currY)){
                    direction = "Diagonal Right"
                } 
                else if ((nextX > currX && nextY < currY) || (nextX < currX && nextY > currY)){
                    direction = "Diagonal Left"
                }
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
            const linkNum = 1
            //const linkNum = Math.max(1, Math.round(disconnected.length * Math.random() * 2))
            const numGroups = disconnected.length
            const linkPerGroup = Math.max(1,Math.floor(linkNum/numGroups))
            
            for (let i = 0; i < numGroups - 1; i++) {
                const pairs = this.calcDistance(1,disconnected[i],disconnected[i + 1])
                if (pairs[0]) {
                    links.push(pairs[0])
                }
            }
            const routes = []
            for (const link of links) {
                const route = this.linkRouteCalc(link)
                routes.push(this.addLinkDirection(route))
            }
            console.log(routes)
            return routes   
        }
        return links
    }
    
    createLinks(){
        let routes = this.calcLinks()
        let positionRoutes = []
        for (const route of routes){
            let linkNum = 0;
            const len = route.length
            let startEnd = []
            for (const link of route){
                const [lX,lY, direction] = link.split(",")
                if (linkNum == 0){
                    startEnd.push(`${lX},${lY}`)
                }
                else if(linkNum == len -1){
                    startEnd.push(`${lX},${lY}`)
                }
                const currTerritory = this.findTerritory(Number(lX), Number(lY))
                if (currTerritory && currTerritory.owner == null){
                    currTerritory.isLink = true
                    currTerritory.linkDirection = direction
                }
                linkNum +=1
            }
            positionRoutes.push(startEnd)
        }
        linkRoutes = positionRoutes;
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
        console.log("initialiseGame CALLED");
        this.assignColours()
        this.assignTerritories()
        this.createLinks()
        

    }

    assignColours(players){
        for ( let i = 0; i < this.players.length; i++ ){
            this.players[i].colour = colours[i]
        }
            
    }

    findTerritory = (x, y) => {
        return this.territories.find(t => t.row === x && t.col === y)
    }
    getTerritoryPlayer = (id) => {
        return this.players.find(p => p.id == id)
    }
    //TO ADD
    //REDEEM CARDS - NEED UI
    // TERRITORIES - NEED MAP GEN

}
export { Player, Territory, Continent, Card, GameEngine };
