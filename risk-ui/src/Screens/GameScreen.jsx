import React, { useEffect, useState } from "react";
import * as Components from "../components";
import { GameEngine, Player } from "risk-game"; 
import { io } from "socket.io-client";
const socket = io("http://localhost:5000");



export default function GameScreen() {
    const engineRef = React.useRef(null);
    const [tick, setTick] = useState(0);
    const [deployed, setDeployed] = useState(false);
    const [winner, setWinner] = useState(null)
    const rerender = () => setTick(t => t + 1);
    const engine = engineRef.current;

    useEffect(() => {
        socket.on("game-state", (state) => {
            engineRef.current = GameEngine.deserialise(state);
            rerender();
        });

        
        
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
                        socket.emit("player-action", {
                                action: "nextTurn",
                                payload: {}
                        }); 
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
                            socket.emit("player-action", {
                                action: "nextTurn",
                                payload: {}
                            });
                            setDeployed(false);
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
