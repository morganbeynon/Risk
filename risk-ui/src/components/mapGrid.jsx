import React from 'react'
import { GameEngine, Player, Territory,Continent } from 'risk-game';
import TerritoryCell from './territoryCell';


export default function MapGrid({phase, update}){
    const rows = 15;
    const cols = 15;
    const cellSize = 30;
    const engine = window.GameEngine;
    const player = engine.getCurrentPlayer();
    let action = null
    if (!engine) return <div>Loading map...</div>;
    const findTerritory = (x, y) => {
        return engine.territories.find(t => t.row === x && t.col === y)
    }
    const getTerritoryPlayer = (id) => {
        return engine.players.find(p => p.id == id)
    }
    if(phase == "Deploy"){
        action = engine.deploy.bind(engine);
    }
    else if (phase == "Attack"){
        action = (player, territory) => {
        alert("Need to do attack logic");
        return false;
        }
    }
    else{
        action = (player, territory) => {
        alert("Need to do fortify logic");
        return false;
        }
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
                let troopCount = null
                let cellColour = "grey"
                if (currTerritory){
                    if (currTerritory.owner){
                        const player = getTerritoryPlayer(currTerritory.owner)
                        cellColour = player.colour || "grey"
                        troopCount = currTerritory.troopCount
                    }
                    else{
                        cellColour = "blue"
                    }
                }
                return(
                    <TerritoryCell
                        key = {`${x},${y}`}
                        id = {player.id}
                        colour = {cellColour}
                        troopCount={troopCount}
                        onClick = {() =>{
                           let actionResult = action(player ,currTerritory);
                            update(actionResult);
                           
                        }}
                    />
                );
            })}
        </div>
    );
}

