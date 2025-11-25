import React, { useEffect, useState } from "react";
import * as Components from "../components";
import { GameEngine, Player } from "risk-game";


export default function GameScreen() {
    const [engine, setEngine] = useState(null);
    const [tick, setTick] = useState(0);
    const [deployed, setDeployed] = useState(false);

    //TESTING MAP GRID DELETE AFTER

    useEffect(() => {
        // 1. Create players
        const players = [
            new Player(1, [], 0, 0, [], 0, 3, ['1','2'], "red"),
            new Player(2, [], 0, 0, [], 0, 3, [], "green"),
            new Player(3, [], 0, 0, [], 0, 3, [], "gold"),
            new Player(4, [], 0, 0, [], 0, 3, [], "pink"),
            new Player(5, [], 0, 0, [], 0, 3, [], "purple"),
            new Player(6, [], 0, 0, [], 0, 3, [], "orange")
        ];

        // 2. Make engine instance
        let game = new GameEngine(players, [], [], 0, 0);

        // 3. Generate map + assign owners
        game.createTerritories();
        game.assignTerritories();

        // 4. Expose engine globally so MapGrid reads it
        window.GameEngine = game;

        setEngine(game);
        setDeployed(false);

        
        
    }, []);

    if (!engine) return <div>Loading...</div>;
    return(
            <div
                style={{
                    width: "100%",
                    minHeight: "100vh",            
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "flex-start",
                    gap: "20px",
                    background: "grey"
                }}
            >
                <Components.TurnBar colour= {engine.getCurrentPlayer().colour}/>
                <div
                style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "20px"
                }}
                >
                    <div style={{
                        width: "600px",   // extra space
                        height: "600px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}>
                        <Components.MapGrid phase ={engine.getPhase()} update={(hasDeployed) => {setDeployed(hasDeployed);
                            setTick(t => t + 1)}}/>
                    </div>
                    <Components.ProfileStack playerList={engine.players} />
                </div>
                <Components.GameBar player={engine.getCurrentPlayer()} phase = {engine.getPhase()}/> 
                <Components.Button colour={engine.getCurrentPlayer().colour} onClick={() =>{
                    if (engine.getPhase() == "Deploy"){
                        if(deployed){
                            engine.nextPhase();
                            setDeployed(false)
                            setTick(t => t + 1);
                        }
                        else{
                            alert("Please deploy all available troops")
                            
                        }
                    }
                    else if(engine.getPhase() == "Attack"){
                        engine.nextPhase();
                        setTick(t => t + 1);
                }
                else{
                    engine.nextPhase();
                        setTick(t => t + 1);
                }
               }} />

               <Components.TroopInput colour={engine.getCurrentPlayer().colour}/>
            </div>
    );
}
