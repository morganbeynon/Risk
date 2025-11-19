import React from 'react'
import { GameEngine, Player, Territory,Continent } from 'risk-game';
import TerritoryCell from './territoryCell';


export default function MapGrid(){
    const rows = 15;
    const cols = 15;
    const cellSize = 30;
    const engine = window.GameEngine;
    if (!engine) return <div>Loading map...</div>;
    const findTerritory = (x, y) => {
        return engine.territories.find(t => t.row === x && t.col === y)
    }
    const getTerritoryPlayer = (id) => {
        return engine.players.find(p => p.id == id)
    }

    return(
        <div
            style = {{
                display: "grid",
                gridTemplateColumns: `repeat(${cols}, 30px)`,
                gap: "0px",
            }}
        >
            {Array.from({ length: rows * cols}).map((_, i) => {
                const x = Math.floor(i / cols);
                const y = i % cols;
                const currTerritory = findTerritory(x,y)
                let cellColour = "grey"
                if (currTerritory){
                    if (currTerritory.owner){
                        const player = getTerritoryPlayer(currTerritory.owner)
                        cellColour = player.colour || "grey"
                    }
                    else{
                        cellColour = "blue"
                    }
                }
                return(
                    <TerritoryCell
                        key = {`${x},${y}`}
                        colour = {cellColour}
                        onClick = {() =>{
                            alert(`clicked cell (${x}, ${y}) - territory: ${currTerritory?.id ?? 'none'}`)
                        }}
                    />
                );
            })}
        </div>
    );
}

