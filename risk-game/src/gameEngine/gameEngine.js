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

   attack(player, territory, selectedTerritory) {
        if (!territory || !selectedTerritory){
             return;
        }

        if (territory.id === selectedTerritory.id || territory.owner === selectedTerritory.owner) {
            alert("You cannot attack your own territory");
            return;
        }

        // Must be adjacent
        if (!this.checkAdjacency(territory, selectedTerritory, "Attack")) {
            alert("You must attack an adjacent enemy territory");
            return;
        }

        // Must have >1 troop
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
            selectedTerritory.owner = territory.owner;

            selectedTerritory.troopCount = 1;
            territory.troopCount = ADice;

            return {
                result: true,
                troops: Math.max(0, ADice - 1)
            };
        }

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
                if (innerCard.type == "Calvary" && inCav < 3){
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
    
    getNeighbours(x,y){
        //NOT FOR LINKS - need it for attacking etc
        let directions = [[1,0], [-1,0], [0,1], [0,-1],[1,1], [1,-1], [-1,1], [-1,-1]]
        const neighbours = []
        for (const [px, py] of directions){
            let rx = x + px
            let ry = y + py
            if (rx < 10 && ry < 10 && rx >= 0 && ry >= 0){
                neighbours.push(`${rx},${ry}`)
            }
        }
        return neighbours
    }

    getDirectNeighbours(x,y){
        //FOR LINKS - does not look at diagonals
        let directions = [[1,0], [-1,0], [0,1], [0,-1]]
        const neighbours = []
        for (const [px, py] of directions){
            let rx = x + px
            let ry = y + py
            if (rx < 10 && ry < 10 && rx >= 0 && ry >= 0){
                neighbours.push(`${rx},${ry}`)
            }
        }
        return neighbours
    }

    //Link Functions 
    getConnectingTerritories(x,y){
        let connectingNeighbours = new Set();
        let visited = new Set();
        this.recursiveTerritoryChecker(x,y,connectingNeighbours,visited)
        return connectingNeighbours
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
                    if (
                        adjTerr &&
                        (adjTerr.owner !== null || adjTerr.isLink === true) &&
                        !visited.has(adj)
                    ){
                        stack.push(adj)
                    }
                }


                for (const [a, b] of linkRoutes){
                    if (a === id && !visited.has(b)) stack.push(b)
                    if (b === id && !visited.has(a)) stack.push(a)
                }
            }
        }
        return visited
    }

    findAllGroups(){
        const groups = [];
        const visitedTotal = new Set();

        for (const terr of this.territories){
            if (terr.owner !== null || terr.isLink === true){
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

    findDisconnectedTerritories(i){
        let groups = this.findAllGroups()
        let disconnected = []
        let isDisconnected = false
        if (groups.length > 1){
            disconnected = groups
            isDisconnected = true
        }
        console.log(i, "Disconnected", disconnected)
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
        const route = [[start]]
        let [x, y] = start.split(",").map(Number)
        let [endX, endY] = end.split(",").map(Number)
        const visited = new Set()
        visited.add(start)
  
        while (route.length > 0){
            const path = route.shift()
            const curr = path[path.length -1]
            if (curr == end){
                return path;
            }
            const terr = this.territories.find(t => t.id === curr)
            if (!terr){
                continue
            }


            for (const neigh of this.getDirectNeighbours(terr.row, terr.col)) {
                if (visited.has(neigh)) continue;

                const neighTerr = this.territories.find(t => t.id === neigh)
                if (!neighTerr){
                    continue;
                }

                if (neighTerr.owner === null || neigh === end) {
                    visited.add(neigh);
                    route.push([...path, neigh]);
                }
            }
        } 
        return null 
    }

    orthogonalizePath(route) {
        const result = [route[0]]
        const visited = new Set(result)

        for (let i = 1; i < route.length; i++) {
            const [x1, y1] = route[i - 1].split(",").map(Number)
            const [x2, y2] = route[i].split(",").map(Number)

            if (x1 !== x2 && y1 !== y2) {
                const mid = `${x2},${y1}`
                const midTerr = this.territories.find(t => t.id === mid)
                if (
                    midTerr &&
                    midTerr.owner === null &&
                    midTerr.isLink === false
                ) {
                    result.push(mid)
                } else {
                    return null 
                }
                if (!visited.has(mid)) {
                    result.push(mid)
                    visited.add(mid)
                }
            }

            const end = `${x2},${y2}`
            if (!visited.has(end)) {
                result.push(end)
                visited.add(end)
            }
        }

        return result
    }


    addLinkDirection(route) {
        const directions = new Map();

        for (let i = 0; i < route.length; i++) {
            const [cx, cy] = route[i].split(",").map(Number);
            let dir = null;

            if (i === 0) {
                // First cell: look at next
                const [nx, ny] = route[i + 1].split(",").map(Number);
                if (nx !== cx) dir = "Vertical";
                else dir = "Horizontal";
            } else if (i === route.length - 1) {
                // Last cell: look at previous
                const [px, py] = route[i - 1].split(",").map(Number);
                if (py === cy){
                    dir = "Vertical";
                }
                else
                    { 
                        dir = "Horizontal";
                    }
            } else {
                // Middle cell: look at previous and next
                const [px, py] = route[i - 1].split(",").map(Number);
                const [nx, ny] = route[i + 1].split(",").map(Number);

                const dxPrev = px-cx;
                const dyPrev = py-cy;
                const inOrient = this.cornerOrientation(dxPrev, dyPrev)

                const dxNext = nx - cx;
                const dyNext = ny - cy;
                const outOrient = this.cornerOrientation(dxNext, dyNext)

                // Straight line
                if ((inOrient == "N" && outOrient == "S" || inOrient == "S" && outOrient == "N") || (inOrient == "W" && outOrient == "E" || inOrient == "E" && outOrient == "W")) {
                    if(inOrient == "N" || inOrient == "S"){
                        dir = "Vertical"
                    }
                    else{
                        dir = "Horizontal"
                    }
                } else {
                    // Determine corner type
                    if ((inOrient == "S" && outOrient == "E") || (inOrient == "E" && outOrient == "S")){
                        dir = "CornerSE";
                    }
                    else if ((inOrient == "N" && outOrient == "E") || (inOrient == "E" && outOrient == "N")){
                        dir = "CornerNE";
                    }
                    else if ((inOrient == "S" && outOrient == "W") || (inOrient == "W" && outOrient == "S")){
                        dir = "CornerSW";
                    }
                    else if ((inOrient == "N" && outOrient == "W") || (inOrient == "W" && outOrient == "N")){
                        dir = "CornerNW";
                    }
                }
            }

            directions.set(`${cx},${cy}`, dir);
        }

        return directions;
    }

    cornerOrientation(dx, dy) {
        if (dx === -1 && dy === 0) {
            return "N"; // up
        } 
        else if (dx === 1 && dy === 0) {
            return "S"; // down
        } 
        else if (dx === 0 && dy === 1) {
            return "E"; // right
        } 
        else if (dx === 0 && dy === -1) {
            return "W"; // left
        } 
        else {
            return null;
        }
    }



    calcLinks(disconnected) {
        ///CHECK THIS FIRST
        const links = [];
        if (disconnected.length <= 1) return links;

        const remaining = [...disconnected];
        const connected = [remaining.shift()]; 

        while (remaining.length) {
            let minDist = Infinity;
            let minPair = null;
            let removeIdx = -1;

            for (let i = 0; i < connected.length; i++) {
                for (let j = 0; j < remaining.length; j++) {
                    const pair = this.calcDistance(1, connected[i], remaining[j])[0];
                    if (!pair) continue;
                    const terr1 = this.territories.find(t => t.id === pair[0]);
                    const terr2 = this.territories.find(t => t.id === pair[1]);
                    const dist = this.manhattanDistance(terr1, terr2);
                    if (dist < minDist) {
                        minDist = dist;
                        minPair = pair;
                        removeIdx = j;
                    }
                }
            }

            if (minPair) {
                links.push(minPair);
                connected.push(remaining.splice(removeIdx, 1)[0]);
            } else {
                console.log("Failed to link all groups");
                break;
            }
        }

        return links;
    }

    resetLinks(){
        linkRoutes = []
        for(const terr of this.territories){
            terr.isLink = false
            terr.linkDirection = null
        }
    }

    createLinks(disconnected) {
        linkRoutes = [];

        const pairs = this.calcLinks(disconnected);
        const positionRoutes = [];

        for (const pair of pairs) {
            let route =
                this.linkRouteCalc(pair) ||
                this.linkRouteCalc([pair[1], pair[0]]);

            if (!route) {
                console.warn("No route found for", pair);
                continue;
            }

            const orthRoute = this.orthogonalizePath(route) || route;
            const linkDirections = this.addLinkDirection(orthRoute);

            for (const cell of orthRoute) {
                const [x, y] = cell.split(",").map(Number);
                const terr = this.findTerritory(x, y);

                if (terr && terr.owner === null) {
                    terr.isLink = true;
                    terr.linkDirection = linkDirections.get(cell);
                }
            }

            positionRoutes.push([orthRoute[0], orthRoute.at(-1)]);
        }

        linkRoutes = positionRoutes;
    }


    attemptLinks(){
        this.resetLinks()
        const { disconnected } = this.findDisconnectedTerritories()
        if (disconnected.length <= 1) return true
        this.createLinks(disconnected)
        const { isDisconnected } = this.findDisconnectedTerritories()
        return !isDisconnected
    }
    

    createTerritories(){
        this.territories = []
        for (let row = 0; row < 10; row++){
           for( let col = 0; col < 10; col++){
                
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
        if (this._initialised == true){
            return
        }
        this._initialised = true
        this.assignColours()
        this.assignTerritories()
        this.attemptLinks()
        

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
