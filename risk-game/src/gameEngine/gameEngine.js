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
        this.deployableTroops = totalTroops - placedTroops
        this.cards = cards
        this.colour = colour
    }
}

class Territory {
    static instances = [];
    constructor(row, col,id, troopCount = 0, owner= null, adjacent = [], continent = null){
        this.id = id
        this.row = row
        this.col = col
        this.troopCount = troopCount
        this.owner = owner
        this.adjacent = adjacent
        this.continent = continent
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
        this.owner = owner
        this.territoryID = territoryID
        this.type = type
    }
    newCard(owner){
        cardTypes = ['Soldier', 'Cavalry', 'Tank']
        type = cardTypes[(Math.floor(Math.random() * 3) +1)]
        territoryID = GameEngine.territories[(Math.floor(Math.random() * GameEngine.territories.length) +1)].id
        owner = GameEngine.players[GameEngine.turn].id
        id = idCount
        idCount += 1
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
        return turn
    }

    getCurrentPlayer(){
        return this.players[this.turn]
    }

    getPhase(phases){
        return Phases[this.phaseNumber]
    }

    nextPhase(phases){
        this.phaseNumber = (this.phaseNumber + 1) % Phases.length;
    }

    deploy(player, territory){
        if (territory.owner == player.id){
            territory.troops += player.deployableTroops
            placedTroops += player.deployableTroops
            player.deployableTroops = 0;
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
                    AResults = [(Math.floor(Math.random() * 6) +1)]
                }
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
                selectedTerritory.owner = territory.owner
                selectedTerritory.troopCount = ADice
                territory.troopCount = 1
                newCard = Card.newCard(this.player)
                this.player.cards = this.player.cards.push(newCard) 
            }
            else{
                territory.troopCount = 1
                selectedTerritory.troopCount = DDice
            }
        }
        else(print("Must fortify to an adjacent enemy territory"))
        return
    }
    fortify(player, territory, selectedTerritory){
        if(territory.adjacent.includes(selectedTerritory.id) && selectedTerritory.id == territory.id){
            selectedTerritory.troopCount = territory.troopCount
            territory.troopCount = 1
        } 
        else(print("Must fortify to an adjacent owned territory"))
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

    createTerritories(){
        this.territories = []
        for (let row = 0; row < 15; row++){
            for( let col = 0; col < 15; col++){
                
                    const neighbours = this.getNeighbours(row,col)
                    const id = `${row},${col}`
                    const territory = new Territory( row,col, id, 0, null, neighbours, null)
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
        const terrLen = this.player.territories.length
        if (terrLen > 6){
            terrLen - 6
            reTroopCount = Math.floor(terrLen / 3)
        }
        
        continentBonus = this.continentValueCheck(player)
        reTroopCount += continentBonus

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
    //TO ADD
    //REDEEM CARDS - NEED UI
    // TERRITORIES - NEED MAP GEN

}
export { Player, Territory, Continent, Card, GameEngine };
