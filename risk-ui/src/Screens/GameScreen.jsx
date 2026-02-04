import React, { useEffect, useState } from "react";
import * as Components from "../components";
import { GameEngine, Player } from "risk-game";


export default function GameScreen() {
    const engineRef = React.useRef(null);
    const [tick, setTick] = useState(0);
    const [deployed, setDeployed] = useState(false);
    const [winner, setWinner] = useState(null)
    const rerender = () => setTick(t => t + 1);
    const engine = engineRef.current;


    //TESTING MAP GRID DELETE AFTER

    useEffect(() => {
        // 1. Create players
        const players = [
            new Player(1, [], 0, 0, [], 0, 3, [], "red", false),
            new Player(2, [], 0, 0, [], 0, 3, [], "green", false),
            new Player(3, [], 0, 0, [], 0, 3, [], "gold", false),
            new Player(4, [], 0, 0, [], 0, 3, [], "pink", false),
        ];

        // 2. Make engine instance
        let game = new GameEngine(players, [], [], 0, 0);
        engineRef.current = game;

        // 3. Generate map + assign owners
        game.createTerritories();
        game.assignTerritories();
        game.attemptLinks();

        // 4. Expose engine globally so MapGrid reads it
        window.GameEngine = game;

        setDeployed(false);
        rerender()
        
        
    }, []);

    useEffect(() => {
        const engine = engineRef.current;
        if (engine && engine.winner) {
            setWinner(engine.winner);
        }
    }, [tick]);

    if (!engineRef.current) return <div>Loading...</div>;
    return(
            <div
                style={{
                    width: "100vw",
                    height: "100vh",
                    display: "flex",
                    flexDirection: "column",
                    background: "blue",
                    overflow: "hidden",
                    alignItems: "center",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        marginBottom: "12px",
                    }}
                    >
                    <Components.TurnBar colour={engine.getCurrentPlayer().colour} />
                    <Components.Clock 
                        key = {engine.turn}
                        alarm ={() => {
                        if (winner){
                            return
                        }
                        engine.nextTurn();  
                        setDeployed(false);       
                        rerender();
                    }} />
                </div>

                <div
                style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "10px",
                    height: "500px"
                }}
                >
                    <div style={{
                        width: "500px", 
                        height: "500px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}>
                        <Components.MapGrid engine = {engine} phase ={engine.getPhase()} update={(hasDeployed) => {setDeployed(hasDeployed);
                            rerender()}} render = {() => {rerender()}} 
                        />
                    </div>
                    <div
                        style={{
                            background: "#111",
                            padding: "5px",
                            borderRadius: "5px",
                            boxShadow: "0 4px 0px rgba(0,0,0,0.4)",
                        }}
                        >
                        <Components.ProfileStack playerList={engine.players} />
                        </div>
                </div>
                <div style={{ marginBottom: "8px" }}>
                    <Components.GameBar
                        engine={engine}
                        player={engine.getCurrentPlayer()}
                        phase={engine.getPhase()}
                    />
                </div>
                <Components.Button colour={engine.getCurrentPlayer().colour} onClick={() =>{
                    if (winner){
                        return
                    }
                    if (engine.getPhase() == "Deploy"){
                        if(deployed){
                            engine.nextPhase();
                            setDeployed(false)
                            rerender();
                        }
                        else{
                            alert("Please deploy all available troops")
                            
                        }
                    }
                    else if(engine.getPhase() == "Attack"){
                        engine.nextPhase();
                        rerender();
                }
                else{
                    engine.nextPhase();
                        rerender();
                }
               }} />
               <Components.WinPopUp
                    visible={!!winner}
                    winner={winner}
                    onConfirm={() => {
                        window.location.reload();
                    }}
                />
            </div>
    );
}
