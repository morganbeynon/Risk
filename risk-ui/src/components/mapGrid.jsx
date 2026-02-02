import React from 'react'
import { GameEngine } from 'risk-game/src/gameEngine/index.js';
import TerritoryCell from './territoryCell';
import TroopInput from './troopInput';

export default function MapGrid({ phase, update, render }) {
    const rows = 6;
    const cols = 6;
    const engine = window.GameEngine;
    const player = engine.applyAction("getCurrentPlayer");

    const [sourceTerritory, setSourceTerritory] = React.useState(null);
    const [sourceTerritories, setSourceTerritories] = React.useState([]);
    const [reinforced, setReinforced] = React.useState(false);
    const [isVisible, setIsVisible] = React.useState(false);
    const [currentTerritory, setCurrTerritory] = React.useState(null);
    const [validAmount, setValidAmount] = React.useState(0);
    const [attackSource, setAttackSource] = React.useState(null);


    if (!engine) return <div>Loading map...</div>;

    return (
        <div
            style={{
                display: "grid",
                gridTemplateColumns: `repeat(${cols}, 45px)`,
                gap: "0px",
            }}
        >
            {Array.from({ length: rows * cols }).map((_, i) => {
                const x = Math.floor(i / cols);
                const y = i % cols;
                const currTerritory = engine.applyAction("findTerritory",{x: x, y: y});

                let troopCount = null;
                let cellColour = "grey";

                if (currTerritory) {
                    if (currTerritory.owner) {
                        const cellPlayer = engine.applyAction("getPlayerByTerr", {id: currTerritory.owner});
                        cellColour = cellPlayer.colour || "grey";
                        troopCount = currTerritory.troopCount;
                    } else {
                        cellColour = "blue";
                    }
                }

                return (
                    <TerritoryCell
                        key={`${x},${y}`}
                        id={player.id}
                        colour={cellColour}
                        troopCount={troopCount}
                        direction={currTerritory.linkDirection}
                        isLink={currTerritory.isLink}
                        onClick={() => {

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

                                const result = engine.applyAction("attack",
                                    {player: player,
                                    territory: sourceTerritory,
                                    selectedTerritory: currTerritory
                                    }
                                );

                                update(true);

                                if (result?.result) {
                                    if (result.troops > 0) {
                                        setValidAmount(result.troops);
                                        setCurrTerritory(currTerritory);
                                        setAttackSource(sourceTerritory);
                                        setIsVisible(true);
                                    }
                                }

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

                                    const neighbours = Array.from(
                                        engine.applyAction("getConnectingTerritories",
                                            {x: sourceTerritories[0].row,
                                            y: sourceTerritories[0].col}
                                        )
                                    );

                                    if (!neighbours.includes(currTerritory.id)) {
                                        alert("Must reinforce to a connected territory");
                                        setSourceTerritories([]);
                                        return;
                                    }

                                    const max = sourceTerritories[0].troopCount - 1;
                                    if (max <= 0) {
                                        alert("You must leave at least one troop behind");
                                        return;
                                    }

                                    setValidAmount(max);
                                    setCurrTerritory(currTerritory);
                                    setIsVisible(true);
                                }
                            }
                        }}
                    />
                );
            })}

            <TroopInput
                colour={player.colour}
                validAmount={validAmount}
                visible={isVisible}
                onConfirm={(amount) => {


                    if (phase === "Deploy" && currentTerritory) {
                        engine.applyAction("deploy",{player: player, territory: currentTerritory, amount: amount});
                        update(true);
                        setIsVisible(false);
                        setCurrTerritory(null);
                        render();
                        if (player.deployableTroops === 0) update(true);
                    }

                    else if (phase === "Reinforce" && sourceTerritories[0] && currentTerritory) {
                        engine.applyAction("fortify",
                            {player: player,
                            territory: sourceTerritories[0],
                            selectedTerritory: currentTerritory,
                            amount: amount}
                        );
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
                        attackSource.troopCount -= amount;
                        currentTerritory.troopCount += amount;

                        update(true);
                        setAttackSource(null);
                        setCurrTerritory(null);
                        setIsVisible(false);
                        update(true);
                    }

                    }
                }
            
            />
        </div>
    );
}
