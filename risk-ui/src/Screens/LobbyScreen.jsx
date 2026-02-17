import React, { useEffect, useState } from "react";
import socket from '../socket';
import { useNavigate } from "react-router-dom";

export default function LobbyScreen({ onGameStart }) {
    const navigation = useNavigate();
    const [name, setName] = useState("");
    const [joined, setJoined] = useState(false);
    const [lobby, setLobby] = useState([]);
    const [isHost, setIsHost] = useState(false);

    const ready = isHost && lobby.length >= 2;
    let buttonColour = "grey"
    let opacity = 0.5
    let cursor = "not-allowed"
    if (ready){
        buttonColour = "green"
        opacity = 1
        cursor = "pointer"
    }

    const join = () => {
        if (name.trim()) {
            socket.emit("player-joined", name);
            setJoined(true);
        }
    }

    const startGame = () => {
        if (ready) {
            socket.emit("start-game");
            navigate("/GameScreen");
        }
    };

    useEffect(() => {
        socket.on("lobby-update", (players) => {
            setLobby(players);
    
            if (players.length > 0 && players[0].socketId === socket.id) {
                setIsHost(true);
            } else {
                setIsHost(false);
            }
        });

        socket.on("game-start", (initialState) => {
            onGameStart(initialState);
            navigation.navigate('/GameScreen');
        });

        return () => {
            socket.off("lobby-update");
            socket.off("game-start");
        };
    }, [onGameStart, navigation]); 

    return (
        <div style={{
            width: "100vw", 
            height: "100vh", 
            display: "flex",
            flexDirection: "column", 
            background: "#1a2a6c",
            alignItems: "center", 
            justifyContent: "center", 
            color: "white"
        }}>
            <h1 style={{ 
                fontSize: 60, 
                marginBottom: 20 
                }}>
                RISK
            </h1>

            {!joined ? (
                <div style={{ 
                    display: "flex", 
                    flexDirection: "column", 
                    gap: "10px"
                }}>
                    <input
                        style={{ padding: "10px", 
                            fontSize: "18px", 
                            borderRadius: "5px" }}
                        placeholder="Enter Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <button onClick={join} style={{ padding: "10px", cursor: "pointer" }}>
                        Join Lobby
                    </button>
                </div>
            ) : (
                <div style={{ textAlign: "center" }}>
                    <h3>Lobby ({lobby.length}/6)</h3>
                    <ul>
                        {lobby.map((p) => (
                            <li 
                            key={p.socketId} 
                            style={{ 
                                fontSize: 20, 
                                margin: "5px 0" 
                            }}>
                                {p.name} {p.socketId === socket.id ? "(You)" : ""}
                                {lobby[0].socketId === p.socketId ? " (Host)" : ""}
                            </li>
                        ))}
                    </ul>

                    <p style={{
                        marginTop: 20,
                        fontSize: 15
                        }}>
                        {isHost 
                            ? (lobby.length < 2 ? "Waiting for more players..." : "Ready to start!") 
                            : "Waiting for host to start..."}
                    </p>

                    {isHost && (
                        <button
                            style={{
                                background: buttonColour,
                                cursor: cursor,
                                opacity: opacity,
                                border: "black",
                                padding: "15px 30px",
                                fontSize: "20px",
                                fontWeight: "bold",
                                color: "white",
                                borderRadius: "10px",
                                marginTop: "20px"
                            }}
                            onClick={startGame}
                            disabled={!ready}
                        >
                            Begin Game
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}