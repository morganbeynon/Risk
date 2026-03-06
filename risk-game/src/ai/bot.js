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
        
        for (const terr of territories){
            let surrounded = true
            for (const neigh of terr.adjacent){
                const neighbour = engine.territories.find(t => t.id === neigh);
                if (neighbour.owner != bot.id && neighbour.owner != null){
                    surrounded = false
                    break
                } 
            }
            
            if (potentialTerr == null){
                potentialTerr = terr
            }
            if (terr.troopCount < potentialTerr.troopCount && !surrounded){
                potentialTerr = terr
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
        let borderTerr = []
        let toTerr = null
        let fromTerr = null
        let difference = 0
        for (const terr of territories){
            if (terr.troopCount > 1){
                for (const neigh of terr.adjacent){
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
        for (const terr of territories){
            let surrounded = true
            for (const neigh of terr.adjacent){
                const neighbour = engine.territories.find(t => t.id === neigh);
                if (neighbour && neighbour.owner !== null && neighbour.owner !== bot.id){
                    surrounded = false
                    break
                }
            }
            if (!surrounded){
                if (!toTerr || toTerr.troopCount > terr.troopCount){
                    toTerr = terr
                }
            }
            else{
                if(!fromTerr|| fromTerr.troopCount < terr.troopCount){
                    fromTerr = terr
                }
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