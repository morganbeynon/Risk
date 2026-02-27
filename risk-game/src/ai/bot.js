import { GameEngine } from "../gameEngine/gameEngine"

const Bot= {
    chooseAction(engine, bot){
        const id = bot.id
        const territoriesID = bot.territories
        const territories = territories.map(
            id => engine.territories.find(t => t.id === id))
        if (phase == "Deploy"){
            this.calcDeploy(engine, bot, territories)
        }
        else if (phase == "Attack"){

        }
        else if (phase == "Reinforce"){
            this.calcReinforce(engine,bot, territories)
        }

    },
    calcDeploy(engine, bot, territories){
        let potentialTerr = null
        let surrounded = true
        for (const terr of bot.territories){
            for (neigh in terr.adjacent){
                const neighbour = engine.territories.find(t => t.id === neighID);
                if (neighbour.owner != bot.id){
                    surrounded = false
                    break
                } 
            }
            if (!potentialTerr && !surrounded|| terr.troopCount < potentialTerr){
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
                    territory: fromTerr,       
                    selectedTerritory: toTerr,  
                    amount: fromTerr.troopCount - 1 
                }
            };
    },

    calcAttack(){
        let borderTerr = []
        let toTerr = null
        let fromTerr = null
        for (const terr of bot.territories){
            for (neigh in terr.adjacent){
                const neighbour = engine.territories.find(t => t.id === neighID);
                if (neighbour.owner != bot.id){
                    borderTerr.append(neighbour)
                } 
            }
        }
        
    },

    calcReinforce(engine, bot, territories){
        let toTerr = null
        let fromTerr =  null
        let surrounded = true
        for (const terr of territories){
            for (neigh in terr.adjacent){
                const neighbour = engine.territories.find(t => t.id === neighID);
                if (neighbour.owner != id){
                    surrounded = false
                    break
                }
            }
            if (!toTerr && !surrounded || !surrounded && toTerr.troopCount > terr.troopCount){
                toTerr = terr
            }
            else if(!fromTerr && surrounded|| surrounded && fromTerr.troopCount . terr.troopCount){
                fromTerr = terr
            }
        }

        if (toTerr && fromTerr && engine.checkAdjacency(fromTerr, toTerr, "Reinforce")){
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