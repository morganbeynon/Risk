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
        if (bot.deployableTroops <= 0) {
            return { action: "nextPhase", payload: {} };
        }
        let potentialTerr = null
        let borderTerrs = new Set()
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
            }
        }
        if (!borderTerrs){
            console.log("borderTerrs empty")
        }
        for (const borderTerr of borderTerrs){
            if (!borderTerr || !borderTerr.adjacent){
                console.log("Border terr not there")
            }
            for (const adjTerr of borderTerr.adjacent){
                const adjacentTerr = engine.territories.find(t => t.id === adjTerr);
                if (adjacentTerr && adjacentTerr.owner !== null && adjacentTerr.owner !== bot.id){
                    let difference = adjacentTerr.troopCount - borderTerr.troopCount;
                    if (difference > greatestDiff){
                        potentialTerr = borderTerr
                        greatestDiff = difference
                    }
                }
            }
            
        }    

        if (!potentialTerr){
            potentialTerr = territories[0]
        }
        return {
                action: "deploy",
                payload: {
                    player: bot,
                    territory: potentialTerr,         
                    amount: bot.deployableTroops 
                }
            };
    },

    calcAttack(engine, bot, territories){
        let toTerr = null
        let fromTerr = null
        let difference = 0
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
                        if (terr.troopCount - neighbour.troopCount > difference){
                            toTerr = neighbour
                            fromTerr = terr
                            difference = terr.troopCount - neighbour.troopCount
                        }
                    } 
                }
            }
        }
        if (toTerr == null || fromTerr == null || difference == 0){
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
        if (!borderTerrs){
            console.log("borderTerrs empty")
        }
        for (const borderTerr of borderTerrs){
            if (!borderTerr || !borderTerr.adjacent){
                console.log("Border terr not there")
            }
            for (const adjTerr of borderTerr.adjacent){
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
          
        if (toTerr && fromTerr && fromTerr.troopCount > 1 && engine.checkAdjacency(fromTerr, toTerr, "Reinforce")){
            return {
                action: "fortify",
                payload: {
                    player: bot,
                    territory: fromTerr,       
                    selectedTerritory: toTerr,  
                    amount: fromTerr.troopCount - 1 
                }
            };
        }
        return{action: "nextPhase", payload: {}}
        
    },
}

export {Bot}