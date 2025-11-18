import React, { useEffect, useState } from "react";
import MapGrid from "./components/mapGrid";
import { GameEngine, Player } from "risk-game";

export default function App() {
    const [engine, setEngine] = useState(null);
    //TESTING MAP GRID DELETE AFTER

    useEffect(() => {
        // 1. Create players
        const players = [
            new Player(1, [], 0, 0, [], 0, 0, [], "red"),
            new Player(2, [], 0, 0, [], 0, 0, [], "blue")
        ];

        // 2. Make engine instance
        const game = new GameEngine(players, [], [], 0, 0);

        // 3. Generate map + assign owners
        game.createTerritories();
        game.assignTerritories();

        // 4. Expose engine globally so MapGrid reads it
        window.GameEngine = game;

        setEngine(game);
    }, []);

    if (!engine) return <div>Loading...</div>;

    return <MapGrid />;
}
