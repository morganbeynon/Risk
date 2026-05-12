import React from 'react'
import TerritoryCell from './territoryCell';
import TroopInput from './troopInput';
import socket from '../socket'

export default function MapGrid({myTurn, territories, players, currentPlayer, phase, update, render, winner}) {
    const rows = 6;
    const cols = 6;
    const player = currentPlayer

    const [sourceTerritory, setSourceTerritory] = React.useState(null);
    const [sourceTerritories, setSourceTerritories] = React.useState([]);
    const [reinforced, setReinforced] = React.useState(false);
    const [isVisible, setIsVisible] = React.useState(false);
    const [currentTerritory, setCurrTerritory] = React.useState(null);
    const [validAmount, setValidAmount] = React.useState(0);
    const [attackSource, setAttackSource] = React.useState(null);

    //loading screen if territories not set yet
    if (!territories) return <div>Loading map...</div>;

    return (
        <div
            style={{
                display: "grid",
                gridTemplateColumns: `repeat(${cols}, 45px)`,
                gap: "0px",
            }}
        >
            
            {Array.from({ length: rows * cols }).map((_, i) => {
                //iterate each cell.
                const x = Math.floor(i / cols);
                const y = i % cols;
                const currTerritory = territories.find(t => t.row === x && t.col === y)

                let troopCount = null;
                let cellColour = "#1a2a6c" ;
                //check for ownership and attributes 
                if (currTerritory) {
                    if (currTerritory.owner !== null && currTerritory.owner !== undefined) {
                        const cellPlayer = players.find(p => p.id === currTerritory.owner);
                        cellColour = cellPlayer?.colour ??"#1a2a6c",
                        troopCount = currTerritory.troopCount;
                    }

                }
                //safety check
                if (!currTerritory) {
                    return (
                        <TerritoryCell
                        key={`${x},${y}`}
                        colour="grey"
                        troopCount={null}
                        onClick={() => {}}
                        />
                    );
                }

                return (
                    //instantiate individual territory cell and give specific phase handling
                    <TerritoryCell
                        key={`${x},${y}`}
                        id={player.id}
                        colour={cellColour}
                        troopCount={troopCount}
                        direction={currTerritory.linkDirection}
                        isLink={currTerritory.isLink}
                        onClick={() => {
                            if (!myTurn){
                                return
                            }
                            if (phase === "Deploy") {
                                setReinforced(false);
                                if (player.deployableTroops <= 0) {
                                    alert("You do not have any more troops to deploy");
                                    return;
                                }

                                if (currTerritory.owner !== player.id) {
                                    alert("You can only deploy to owned territories");
                                    return;
                                }

                                setValidAmount(player.deployableTroops);
                                setCurrTerritory(currTerritory);
                                setIsVisible(true);
                                return;
                            }

                            if (phase === "Attack") {

                                if (!sourceTerritory) {
                                    if (currTerritory.owner === player.id) {
                                        setSourceTerritory(currTerritory);
                                    } else {
                                        alert("Select an owned territory to attack from");
                                    }
                                    return;
                                }

                                if (currTerritory.owner === player.id) {
                                    alert("You cannot attack your own territory");
                                    setSourceTerritory(null);
                                    return;
                                } 
                                socket.emit("player-action", { action: "attack", payload: { player, territory: sourceTerritory, selectedTerritory: currTerritory } }, (response) => {
                                    update(true); 
                                    
                                    if (response?.result) {
                                        if (response.troops > 0) {
                                            setValidAmount(response.troops);
                                            setCurrTerritory(currTerritory);
                                            setAttackSource(sourceTerritory);
                                            setIsVisible(true);
                                        }
                                    }
                                })

                                setSourceTerritory(null);
                                return;
                            }

                            if (phase === "Reinforce") {
                                if (reinforced) {
                                    alert("You can only reinforce once a turn");
                                    return;
                                }

                                if (sourceTerritories.length === 0) {
                                    if (currTerritory.owner === player.id) {
                                        setSourceTerritories([currTerritory]);
                                    } else {
                                        alert("Select an owned territory to reinforce from");
                                    }
                                    return;
                                }

                                if (sourceTerritories.length === 1) {
                                    if (currTerritory.owner !== player.id) {
                                        alert("You cannot reinforce to enemy territory");
                                        setSourceTerritories([]);
                                        return;
                                    }

                                    socket.emit(
                                        "player-action",
                                        {
                                            action: "getConnectingTerritories",
                                            payload: {
                                            x: sourceTerritories[0].row,
                                            y: sourceTerritories[0].col
                                            }
                                        },
                                        (neighbours) => {
                                            if (!neighbours.includes(currTerritory.id)) {
                                            alert("Must reinforce to a connected territory");
                                            setSourceTerritories([]);
                                            return;
                                            }

                                            const max = sourceTerritories[0].troopCount - 1;
                                            setValidAmount(max);
                                            setCurrTerritory(currTerritory);
                                            setIsVisible(true);
                                        }
                                    );
                                }
                            }
                        }}
                    />
                );
            })}
        
            <TroopInput
                //Make overlay 
                phase={phase}
                colour={player.colour}
                validAmount={validAmount}
                visible={isVisible && !winner}
                onConfirm={(amount) => {
                    //specific phase overlay information
                    if (phase === "Deploy" && currentTerritory) {
                        socket.emit("player-action", { action: "deploy", payload: {player, territory: currentTerritory, amount} })
    
                        update(true);
                        setIsVisible(false);
                        setCurrTerritory(null);
                        render();
                        if (player.deployableTroops === 0) update(true);
                    }

                    else if (phase === "Reinforce" && sourceTerritories[0] && currentTerritory) {
                        
                        let fortTerr = sourceTerritories[0]
                        socket.emit("player-action", { action: "reinforce", payload: {player, territory: fortTerr, selectedTerritory: currentTerritory, amount} })
    
                        update(true);
                        setSourceTerritories([]);
                        setCurrTerritory(null);
                        setIsVisible(false);
                        setReinforced(true);
                        update(true);
                    }

                    else if (phase === "Attack") {
                        if (!attackSource || !currentTerritory){
                            return;
                        } 

                        socket.emit("player-action", { action: "moveAfterAttack", payload: {sourceTerr: attackSource, moveTerr: currentTerritory, amount} })
    
                        update(true);
                        setAttackSource(null);
                        setCurrTerritory(null);
                        setIsVisible(false);
                        update(true);
                    }

                    }
                }
                onClose={() => setIsVisible(false)}
            
            />
        </div>
    );
}
