import React, { useEffect, useState } from "react";
import * as Components from "./components";
import { GameEngine, Player } from "risk-game";


export default function App() {
    const [engine, setEngine] = useState(null);
    const [players, setPlayers] = useState([])
    //TESTING MAP GRID DELETE AFTER

    useEffect(() => {
        // 1. Create players
        const players = [
            new Player(1, [], 0, 0, [], 0, 0, ['1','2'], "red"),
            new Player(2, [], 0, 0, [], 0, 0, [], "green"),
            new Player(3, [], 0, 0, [], 0, 0, [], "yellow"),
            new Player(4, [], 0, 0, [], 0, 0, [], "pink"),
            new Player(5, [], 0, 0, [], 0, 0, [], "purple"),
            new Player(6, [], 0, 0, [], 0, 0, [], "orange")
        ];

        // 2. Make engine instance
        const game = new GameEngine(players, [], [], 0, 0);

        // 3. Generate map + assign owners
        game.createTerritories();
        game.assignTerritories();

        // 4. Expose engine globally so MapGrid reads it
        window.GameEngine = game;

        setEngine(game);
        setPlayers(players)
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
                    gap: "20px"
                }}
            >
                <Components.TurnBar colour="green"/>
                <div
                style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    gap: "20px"
                }}
                >
                    <Components.MapGrid />
                    <Components.ProfileStack playerList={players} />
                </div>
                <Components.GameBar players={players}/> 
                <Components.Button colour="green" onClick={() => alert("Next phase")} />
            </div>
    );
}
