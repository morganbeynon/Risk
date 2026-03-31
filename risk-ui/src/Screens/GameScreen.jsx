import React, { useEffect, useState } from "react";
import * as Components from "../components";
import MapGrid from "../components/mapGrid";
import { useNavigate, useLocation } from "react-router-dom";
import socket from '../socket'



export default function GameScreen({screenPlayer}) {

    const [tick, setTick] = useState(0);
    const [deployed, setDeployed] = useState(false);
    const [winner, setWinner] = useState(null)
    const rerender = () => setTick(t => t + 1);
    const [gameState, setGameState] = useState(null);
    const [phase, setPhase] = useState(null);
    let myTurn = false
    const location = useLocation();
    const { name, lobby, isHost } = location.state
    const navigate = useNavigate();

    useEffect(() => {
        socket.on("game-state", (state) => {
            setGameState(state);
        });


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


    if (!gameState){
        return <div>Loading Game...</div>
    }
    else{
        myTurn = screenPlayer === gameState.players[gameState.turn].id;
    }
    return(
            <div
                style={{
                    width: "100vw",
                    height: "100vh",
                    display: "flex",
                    flexDirection: "column",
                    background: "#1a2a6c",
                    overflow: "hidden",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",                
                }}
            >
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                    }}
                    >
                    <Components.TurnBar currentPlayer={gameState.players[gameState.turn]} colour={gameState.players[gameState.turn].colour} screenPlayer = {screenPlayer}/>
                    <Components.Clock 
                        endTime={gameState.turnEndTime}
                        winner={winner}
                    />
                </div>

                <div
                style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "10px", 
                    flex: 1,
                    maxHeight: "60vh",
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
                            myTurn = {myTurn}
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
                <div style={{}}>
                    <Components.GameBar
                        myTurn ={myTurn}
                        player={gameState.players[gameState.turn]}
                        phase={gameState.phase}
                    />
                </div> 
                <Components.Button
                    visible={myTurn}
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
                        navigate("/", { state: { name, lobby, isHost } })
                    }}
                />
            </div>
    );
}
