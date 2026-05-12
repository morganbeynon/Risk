import { GameEngine } from "../gameEngine/gameEngine.js"

const Bot= {
    //entry to module
    chooseAction(engine, bot){
        const id = bot.id 
        const territoriesID = bot.territories
        const territories = territoriesID.map(
            id => engine.territories.find(t => t.id === id))
        const phase = engine.getPhase()
        if (phase == "Deploy"){
            return this.calcDeploy(engine, bot, territories)
        }
        else if (phase == "Attack"){
            return this.calcAttack(engine, bot, territories)
        }
        else if (phase == "Reinforce"){
            return this.calcReinforce(engine,bot, territories)
        }

    },

    calcDeploy(engine, bot, territories){
        let troops = bot.deployableTroops
        let moves = []
        let borderThreats = []
        //Check every owned territory
        for (const terr of territories){
            let isBorder = false
            let allNeighbourIds = [...terr.adjacent];
            for (const [a, b] of engine.linkRoutes) {
                if (a === terr.id) allNeighbourIds.push(b);
                if (b === terr.id) allNeighbourIds.push(a);
            } 
            let maxThreat = -Infinity
            //Check neighbours to see if territory is a border 
            for (const neigh of allNeighbourIds){
                const neighbour = engine.territories.find(t => t.id === neigh);
                //calculate threat if so
                if (neighbour && neighbour.owner !== null && neighbour.owner !== bot.id){
                    isBorder = true;
                    const threat = neighbour.troopCount - terr.troopCount;
                    if (threat > maxThreat){
                        maxThreat = threat;
                    }
                    
                }
                
            }
            if (isBorder) {
                borderThreats.push({ terr, need: maxThreat });
            }
        }
        //Put all troops in first territory if no border territories
        if (borderThreats.length === 0) {
            moves.push({
                action: "deploy",
                payload: { player: bot, territory: territories[0], amount: troops }
            });
            moves.push({ action: "nextPhase", payload: {} });
            return moves;
        }
        borderThreats.sort((a, b) => b.need - a.need);
        let placements = []
        let remainingT = troops
        for (const {terr, need} of borderThreats){
            if (remainingT < 1){
                break
            }
            let ideal = Math.max(1, need + 3)
            if (remainingT > ideal){
                placements.push({terr, amount: ideal})
                remainingT -= ideal;
            }
            else{
                placements.push({terr, amount: remainingT})
                remainingT = 0
            }

        }
        if (remainingT > 0 && borderThreats.length > 0){
            let index = 0
            while (remainingT > 0){
                placements.push({terr: borderThreats[index].terr, amount: 1})
                remainingT--
                index = (index + 1) % borderThreats.length
            }
            
        }
        for (const {terr, amount} of placements) {
            if (amount > 0) {
                moves.push({
                    action: "deploy",
                    payload: { player: bot, territory: terr, amount }
                });
            }
        }

        moves.push({ action: "nextPhase", payload: {} });
        return moves;


    },


    calcAttack(engine, bot, territories){
        let toTerr = null
        let fromTerr = null
        let bestScore = -Infinity
        let beatablePlayers = null
    
        //calls beatable players function
        beatablePlayers = this.checkBeatablePlayers(engine, bot);
        //iterates each player checking if they can be beaten in one turn
        if (beatablePlayers.length > 0){
            for (const enemy of beatablePlayers){
                for (const tID of enemy.territories){
                    let territory = engine.territories.find(t => t.id === tID);
                    let allNeighbourIds = [...territory.adjacent];
                    //iterate all of their territories and links
                    for (const [a, b] of engine.linkRoutes) {
                        if (a === territory.id) allNeighbourIds.push(b);
                        if (b === territory.id) allNeighbourIds.push(a);
                    }

                    for (const neighID of allNeighbourIds){
                        const neighbour = engine.territories.find(t => t.id === neighID);
                        if (neighbour && neighbour.owner == bot.id){
                            return {
                                action: "attack",
                                payload: {
                                    player: bot,
                                    territory: neighbour,       
                                    selectedTerritory: territory 
                                }
                            };
                        }
                    }
                }
            }
        }
        //Expand if no beatable players
        for (const terr of territories){
            if (terr.troopCount > 1){
                let allNeighbourIds = [...terr.adjacent];
                for (const [a, b] of engine.linkRoutes) {
                    if (a === terr.id) allNeighbourIds.push(b);
                    if (b === terr.id) allNeighbourIds.push(a);
                } 

                for (const neigh of allNeighbourIds){
                    let neighbour = engine.territories.find(t => t.id === neigh);
                    if (neighbour && neighbour.owner != bot.id && neighbour.owner != null){
                        let ratio = terr.troopCount - neighbour.troopCount
                        if (ratio < 3){
                            continue
                        }
                        let enemyS = 0
                        for (const adj of neighbour.adjacent){
                            const adjacent = engine.territories.find(t => t.id === adj)
                            if (adjacent && adjacent.owner !== bot.id && adjacent.owner !== null){
                                enemyS += 1
                            }
                        }
                        const score = ratio - (enemyS * 0.30);
                        
                        if (score > bestScore && terr.troopCount >= 3){
                            toTerr = neighbour
                            fromTerr = terr
                            bestScore = score
                        }
                    } 
                }
            }
        }
        if (toTerr == null || fromTerr == null){
            return{action: "nextPhase", payload: {}}
        }
        
        return {
                action: "attack",
                payload: {
                    player: bot,
                    territory: fromTerr,       
                    selectedTerritory: toTerr 
                }
        };
        
    },

    checkBeatablePlayers(engine, bot){
        let beatablePlayers = []
        //iterate each player
        for (const player of engine.players){
            if (player.id == bot.id){
                continue
            }
            if (player.territories.length > 5){
                continue
            }
            let beatable = true
            //check every territory - see if player can beat them realistically
            for (const terrId of player.territories){
                const terr = engine.territories.find(t => t.id === terrId);
                let beatableTerr = false;
                let allNeighbourIds = [...terr.adjacent];
                for (const [a, b] of engine.linkRoutes) {
                    if (a === terr.id) allNeighbourIds.push(b);
                    if (b === terr.id) allNeighbourIds.push(a);
                }

                for (const neighID of allNeighbourIds){
                    const neighbour = engine.territories.find(t => t.id === neighID);
                    if (neighbour && neighbour.owner == bot.id){
                        //over double troop count
                        if (((neighbour.troopCount - terr.troopCount) / neighbour.troopCount) > 0.5){
                            beatableTerr = true
                            break
                        }
                    }
                }
                if (!beatableTerr){
                    beatable = false 
                    break
                }
            }
            if (beatable){
                beatablePlayers.push(player)
            }
        }
        beatablePlayers.sort((a,b) => a.territories.length - b.territories.length)
        return beatablePlayers;
    },

    calcReinforce(engine, bot, territories){
        let toTerr = null
        let fromTerr =  null
        let borderTerrs = new Set()
        let internalTerrs = new Set()
        let greatestDiff = -Infinity
        let toTerrThreatDifference = 0
        //iterate every terr and classify border and internal territory
        for (const terr of territories){
            let isBorder = false
            let allNeighbourIds = [...terr.adjacent];
                for (const [a, b] of engine.linkRoutes) {
                    if (a === terr.id) allNeighbourIds.push(b);
                    if (b === terr.id) allNeighbourIds.push(a);
                } 
            for (const neigh of allNeighbourIds){
                const neighbour = engine.territories.find(t => t.id === neigh);
                if (neighbour && neighbour.owner !== null && neighbour.owner !== bot.id){
                    isBorder = true;
                    break;
                }
                
            }
            if (isBorder) {
                borderTerrs.add(terr); 
            } else {
                internalTerrs.add(terr);
            }
        }
        if (borderTerrs.size === 0){
            console.log("borderTerrs empty")
        }
        //iterate border territory
        for (const borderTerr of borderTerrs){
            if (!borderTerr || !borderTerr.adjacent){
                console.log("Border terr not there")
            }
            let allBorderNeighbourIds = [...borderTerr.adjacent];
            for (const [a, b] of engine.linkRoutes) {
                if (a === borderTerr.id) allBorderNeighbourIds.push(b);
                if (b === borderTerr.id) allBorderNeighbourIds.push(a);
            }
            //find most threatened
            for (const adjTerr of allBorderNeighbourIds){
                const adjacentTerr = engine.territories.find(t => t.id === adjTerr);
                if (adjacentTerr && adjacentTerr.owner !== null && adjacentTerr.owner !== bot.id){
                    let difference = (adjacentTerr.troopCount - borderTerr.troopCount) / borderTerr.troopCount;
                    if (difference > greatestDiff){
                        toTerrThreatDifference = adjacentTerr.troopCount - borderTerr.troopCount
                        toTerr = borderTerr
                        greatestDiff = difference
                    }
                }
            }
            
        }

        if (!toTerr) {
            return { action: "nextPhase", payload: {} };
        }
        //get connecting territories 
        const connectedTerrs = engine.getConnectingTerritories(toTerr.row, toTerr.col)
        let maxIValue = -Infinity
        //find internal territory with largest troop count
        for (const internalTerr of internalTerrs) {
            if (internalTerr && connectedTerrs.has(internalTerr.id) && internalTerr.troopCount > maxIValue) {
                maxIValue = internalTerr.troopCount;
                fromTerr = internalTerr;
            }
        }
        let borderFrom = false
        let cBest = -Infinity
        let defensiveNeed = null
        //if no internal, find safest border terr
        if (!fromTerr){
            borderTerrs.delete(toTerr)
            
            for (const borderTerr of borderTerrs){
                if (!borderTerr || !borderTerr.adjacent){
                    console.log("Border terr not there")
                }
                let allNeighbourIds = [...borderTerr.adjacent];
                for (const [a, b] of engine.linkRoutes) {
                    if (a === borderTerr.id) allNeighbourIds.push(b);
                    if (b === borderTerr.id) allNeighbourIds.push(a);
                }
                for (const adjTerr of allNeighbourIds){
                    const adjacentTerr = engine.territories.find(t => t.id === adjTerr);
                    if (adjacentTerr && adjacentTerr.owner !== null && adjacentTerr.owner !== bot.id){
                        let difference = adjacentTerr.troopCount - borderTerr.troopCount;
                        if (difference > cBest && connectedTerrs.has(borderTerr.id) && borderTerr.troopCount > 1){
                            borderFrom = true
                            fromTerr = borderTerr
                            cBest = difference
                            defensiveNeed = difference
                        }
                    }
                }
                
            }
        }
        //check the numbers are validated before returning the action
        if (toTerr && fromTerr && fromTerr.troopCount > 1 && engine.checkAdjacency(fromTerr, toTerr, "Reinforce")){
            let amount = fromTerr.troopCount-1
            if (borderFrom){
                const needed = Math.max(1, toTerrThreatDifference) 
                amount = Math.min(needed, defensiveNeed)
                if (amount <= 0){
                    return { 
                        action: "nextPhase", 
                        payload: {} 
                    }
                }
            }
            return [
                {
                    action: "reinforce",
                    payload: {
                        player: bot,
                        territory: fromTerr,       
                        selectedTerritory: toTerr,  
                        amount: amount 
                    }
                },
                { action: "nextPhase", payload: {} }
            ];
        }
        return{action: "nextPhase", payload: {}}
        
    },
}

export {Bot}