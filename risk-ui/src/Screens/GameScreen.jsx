import React, { useEffect, useState } from "react";
import * as Components from "../components";
import MapGrid from "../components/mapGrid";

import socket from '../socket'



export default function GameScreen() {

    const [tick, setTick] = useState(0);
    const [deployed, setDeployed] = useState(false);
    const [winner, setWinner] = useState(null)
    const rerender = () => setTick(t => t + 1);
    const [gameState, setGameState] = useState(null);
    const [phase, setPhase] = useState(null);

    useEffect(() => {
        socket.on("connect", () => {
            console.log("Socket Connected! ID:", socket.id);
        });

        socket.on("connect_error", (err) => {
            console.error("Connection Error:", err.message);
        });

        const handleState = (state) => {
            console.log("Game State Received:", state);
            setGameState(state);
            setPhase(state.phase);
        };

        socket.on("game-state", handleState);

        if (socket.connected) {
            socket.emit("request-initial-state");
        }

        return () => {
            socket.off("game-state", handleState);
            socket.off("connect");
            socket.off("connect_error");
        };
    }, []);

    useEffect(() => {
        if (gameState?.winner) {
            setWinner(gameState.winner);
        }
    }, [gameState]);


    if (!gameState) return <div>Loading...</div>;
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
                    <Components.TurnBar colour={gameState.players[gameState.turn].colour} />
                    <Components.Clock 
                        key = {gameState.turn}
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
                        <MapGrid
                            territories={gameState.territories}
                            players={gameState.players}
                            currentPlayer={gameState.players[gameState.turn]}
                            phase={phase}
                            update={setDeployed}
                            render={() => {}}
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
                        <Components.ProfileStack playerList={gameState.players} />
                        </div>
                </div>
                <div style={{ marginBottom: "8px" }}>
                    <Components.GameBar
                        player={gameState.players[gameState.turn]}
                        phase={gameState.phase}
                    />
                </div> 
                <Components.Button
                    colour={gameState.players[gameState.turn].colour}
                    onClick={() => {
                        if (winner) return;
                        
                        const currentPlayer = gameState.players[gameState.turn];

                        if (phase === "Deploy") {
                            if (currentPlayer.deployableTroops === 0) {
                                socket.emit("player-action", { action: "nextPhase", payload: {} });
                                setDeployed(false);
                            } else {
                                alert(`Please deploy all available troops. (${currentPlayer.deployableTroops} remaining)`);
                            }
                        } 
                        else if (phase == "Reinforce"){
                            socket.emit("player-action", { action: "nextTurn", payload: {} });
                        }
                        else{
                            socket.emit("player-action", { action: "nextPhase", payload: {} });
                        }
                    }}
                />
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
