 import React from 'react'
import { GameEngine, Player, Territory,Continent } from 'risk-game';
import TerritoryCell from './territoryCell';
import TroopInput from './troopInput';



export default function MapGrid({phase, update, render}){
    const rows = 15;
    const cols = 15;
    const cellSize = 30;
    const engine = window.GameEngine;
    const player = engine.getCurrentPlayer();
    const [selectedTerritories, setSelectedTerritories] = React.useState([]);
    const [mapData, setMapData] = React.useState(engine.territories);
    const [reinforced, setReinforced] = React.useState(false);
    const [isVisible, setIsVisible] = React.useState(false);
    const [firstTerritory, setFirstTerritory] = React.useState(null);
    const [validAmount, setValidAmount] = React.useState(0)


    if (!engine) return <div>Loading map...</div>;
    const findTerritory = (x, y) => {
        return mapData.find(t => t.row === x && t.col === y)
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
                //const isSelected = selectedCell === `${x},${y}`;
                let troopCount = null
                let cellColour = "grey"
                if (currTerritory){
                    if (currTerritory.owner){
                        const cellPlayer = getTerritoryPlayer(currTerritory.owner)
                        cellColour = cellPlayer.colour || "grey"
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
                        //selected={isSelected}
                        onClick = {() =>{
                            if(phase == "Deploy"){
                                if(player.deployableTroops > 0){
                                    setValidAmount(player.deployableTroops)
                                    if (currTerritory.owner == player.id){
                                        setIsVisible(true)
                                        setReinforced(false)
                                        setFirstTerritory(currTerritory)                    
                                    }
                                    else{
                                        alert("You can only deploy to owned territories")
                                    }
                                }
                                else{
                                    alert("You do not have any more troops to deploy")
                                }
                            }
                            else if (phase == "Attack"){
                                    if (selectedTerritories.length == 0){
                                        if (currTerritory.owner == player.id){
                                            setSelectedTerritories([currTerritory])
                                            //setSelectedCell(`${x},${y}`)
                                        }
                                        else{
                                            alert("Select an owned territory first to attack from")
                                        }
                                    }
                                    else if(selectedTerritories.length == 1){
                                        if (currTerritory.owner == player.id){
                                            alert("You cannot attack your own territory")
                                            setSelectedTerritories([])
                                        }
                                        else{      
                                            console.log("Before attack:", selectedTerritories[0], currTerritory);
                                            engine.attack(player, selectedTerritories[0], currTerritory);
                                            console.log("After attack:", selectedTerritories[0], currTerritory);
                                            setMapData([...engine.territories])
                                            setSelectedTerritories([])
                                            update(true)
                                        }
                                        
                                    }
                                    return;   
                            }
                            else if (phase == "Reinforce"){
                                if (reinforced == true){
                                    alert("You can only reinforce once a turn")
                                }
                                else{                                
                                    if (selectedTerritories.length == 0){
                                            if (currTerritory.owner == player.id){
                                                setSelectedTerritories([currTerritory])
                                                //setSelectedCell(`${x},${y}`)
                                            }
                                            else{
                                                alert("Select an owned territory first to reinforce from")
                                            }
                                        }
                                        else if(selectedTerritories.length == 1){
                                            if (currTerritory.owner != player.id){
                                                alert("You cannot reinforce to enemy territory")
                                                setSelectedTerritories([])
                                            }
                                            else{      
                                                engine.fortify(player, selectedTerritories[0], currTerritory);
                                                setMapData([...engine.territories])
                                                setSelectedTerritories([])
                                                setReinforced(true)
                                                update(true)
                                            }
                                            
                                        }
                                        return;  
                                }
                            }
                            
                           
                        }}
                    />
                );
            })}
            <TroopInput colour={engine.getCurrentPlayer().colour} validAmount={validAmount}visible={isVisible} onConfirm ={(amount) => {
                if (firstTerritory) {
                    engine.deploy(player, firstTerritory, amount);
                    setMapData([...engine.territories]);
                    setIsVisible(false);
                    setFirstTerritory(null);
                    render()
                    if (player.deployableTroops === 0){
                         update(true);
                    }
                }
        }}/>
        </div>
        
    );
}

