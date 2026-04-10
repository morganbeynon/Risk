import { GameEngine } from "../gameEngine/gameEngine.js"

const Bot= {
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

        for (const terr of territories){
            let isBorder = false
            let allNeighbourIds = [...terr.adjacent];
            for (const [a, b] of engine.linkRoutes) {
                if (a === terr.id) allNeighbourIds.push(b);
                if (b === terr.id) allNeighbourIds.push(a);
            } 
            let maxThreat = -Infinity
            for (const neigh of allNeighbourIds){
                const neighbour = engine.territories.find(t => t.id === neigh);
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
            const topT = borderThreats[0].terr
            const placement = placements.find(p => p.terr === topT);
            if (placement){
                placement.amount += remainingT
            }
            else{
                placements.push({ terr: topT, amount: remainingT });
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
    

        beatablePlayers = this.checkBeatablePlayers(engine, bot, territories);
        if (beatablePlayers.length > 0){
            for (const enemy of beatablePlayers){
                for (const tID of enemy.territories){
                    let territory = engine.territories.find(t => t.id === tID);
                    let allNeighbourIds = [...territory.adjacent];
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
                        const score = ratio - (enemyS * 0.10);
                        
                        if (score > bestScore){
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
        for (const player of engine.players){
            if (player.id == bot.id){
                continue
            }
            if (player.territories.length > 5){
                continue
            }
            let beatable = true
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
        for (const borderTerr of borderTerrs){
            if (!borderTerr || !borderTerr.adjacent){
                console.log("Border terr not there")
            }
            let allBorderNeighbourIds = [...borderTerr.adjacent];
            for (const [a, b] of engine.linkRoutes) {
                if (a === borderTerr.id) allBorderNeighbourIds.push(b);
                if (b === borderTerr.id) allBorderNeighbourIds.push(a);
            }
            for (const adjTerr of allBorderNeighbourIds){
                const adjacentTerr = engine.territories.find(t => t.id === adjTerr);
                if (adjacentTerr && adjacentTerr.owner !== null && adjacentTerr.owner !== bot.id){
                    let difference = adjacentTerr.troopCount - borderTerr.troopCount;
                    if (difference > greatestDiff){
                        toTerr = borderTerr
                        greatestDiff = difference
                    }
                }
            }
            
        }

        if (!toTerr) {
            return { action: "nextPhase", payload: {} };
        }

        const connectedTerrs = engine.getConnectingTerritories(toTerr.row, toTerr.col)
        let maxIValue = -Infinity
        for (const internalTerr of internalTerrs) {
            if (internalTerr && connectedTerrs.has(internalTerr.id) && internalTerr.troopCount > maxIValue) {
                maxIValue = internalTerr.troopCount;
                fromTerr = internalTerr;
            }
        }
          
        if (!fromTerr){
            borderTerrs.delete(toTerr)
            let cBest = -Infinity
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
                            fromTerr = borderTerr
                            cBest = difference
                        }
                    }
                }
                
            }
        }
        if (toTerr && fromTerr && fromTerr.troopCount > 1 && engine.checkAdjacency(fromTerr, toTerr, "Reinforce")){
            return [
                {
                    action: "fortify",
                    payload: {
                        player: bot,
                        territory: fromTerr,       
                        selectedTerritory: toTerr,  
                        amount: fromTerr.troopCount - 1 
                    }
                },
                { action: "nextPhase", payload: {} }
            ];
        }
        return{action: "nextPhase", payload: {}}
        
    },
}

export {Bot}