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
    const [sourceTerritories, setSourceTerritories] = React.useState([]);
    const [mapData, setMapData] = React.useState(engine.territories);
    const [reinforced, setReinforced] = React.useState(false);
    const [isVisible, setIsVisible] = React.useState(false);
    const [currentTerritory, setCurrTerritory] = React.useState(null);
    const [validAmount, setValidAmount] = React.useState(0)
    const [showOverlay, setShowOverlay] = React.useState(false);
    const [pendingOverlay, setPendingOverlay] = React.useState(false);

    React.useEffect(() => {
        if (pendingOverlay) {
            setIsVisible(true);
            setPendingOverlay(false);
        }
    }, [mapData, pendingOverlay]);

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
                                        setCurrTerritory(currTerritory)                    
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
                                    if (sourceTerritories.length == 0){
                                        if (currTerritory.owner == player.id){
                                            setSourceTerritories([currTerritory])
                                            //setSelectedCell(`${x},${y}`)
                                        }
                                        else{
                                            alert("Select an owned territory Curr to attack from")
                                        }
                                    }
                                    else if(sourceTerritories.length == 1){
                                        if (currTerritory.owner == player.id){
                                            alert("You cannot attack your own territory")
                                            setSourceTerritories([])
                                        }
                                        else{     
                                            let result = engine.attack(player, sourceTerritories[0], currTerritory);
                                            if (result.result){
                                                setValidAmount(result.troops)
                                                setSourceTerritories([sourceTerritories[0]]);
                                                setCurrTerritory(currTerritory);
                                                render() 
                                                setPendingOverlay(true); 
                                            }
                                        }
                                        
                                    }
                                    return;   
                            }
                            else if (phase == "Reinforce"){
                                if (reinforced == true){
                                    alert("You can only reinforce once a turn")
                                }
                                else{                                
                                    if (sourceTerritories.length == 0){
                                            if (currTerritory.owner == player.id){
                                                setSourceTerritories([currTerritory])
                                            }
                                            else{
                                                alert("Select an owned territory Curr to reinforce from")
                                            }
                                        }
                                        else if(sourceTerritories.length == 1){
                                            if (currTerritory.owner != player.id){
                                                alert("You cannot reinforce to enemy territory")
                                                setSourceTerritories([])
                                            }
                                            else{      
                                                setValidAmount(sourceTerritories[0].troopCount-1)
                                                setCurrTerritory(currTerritory)
                                                setMapData([...engine.territories]);
                                                setShowOverlay(true);
                                            }
                                            
                                        }
                                        return;  
                                }
                            }
                            
                           
                        }}
                    />
                );
            })}
            <TroopInput colour={engine.getCurrentPlayer().colour} validAmount={validAmount}visible={isVisible} 
            onConfirm ={(amount) => {
                if (phase == "Deploy"){
                    if (currentTerritory) {
                        engine.deploy(player, currentTerritory, amount);
                        setMapData([...engine.territories]);
                        setIsVisible(false);
                        setCurrTerritory(null);
                        render()
                        if (player.deployableTroops === 0){
                            update(true);
                        }
                    }
                }
                else if (phase == "Reinforce"){
                    if (sourceTerritories[0] && currentTerritory) {
                        engine.fortify(player, sourceTerritories[0], currTerritory, amount);
                        setMapData([...engine.territories]);
                        setSourceTerritories([]);
                        setCurrTerritory(null);
                        setIsVisible(false); 
                        setReinforced(true);
                        update(true);
                    }
                }
                else {
                    currentTerritory.owner = sourceTerritories[0].owner
                    sourceTerritories[0].troopCount -= amount
                    currentTerritory.troopCount += amount 
                    setMapData([...engine.territories])
                    setSourceTerritories([])
                    setIsVisible(false)
                    update(true)
                }
                
        }}/>
        </div>
        
    );
}

