import CardStack from './cardStack'
import PhaseIcon from './phaseIcon';
import CardPopUp from './cardPopUp';
import React, { useEffect, useState } from "react";
import socket from '../socket';



export default function GameBar({player, phase}) {
    const barWidth = 300;
    const barHeight = 50;
    const colour = player.colour;
    
    const [showCards, setShowCards] = React.useState(false);
    const [cardState, setCardState] = useState(null);
    let results = null;


    let text = "";
    if (phase === 'Deploy') {
        text = `Deploy ${player.deployableTroops} Troops`;
    } else if (phase === 'Attack') {
        text = "Attack";
    } else {
        text = "Reinforce";
    }

    const openCards = () => {
        socket.emit("player-action", { action: "checkCards", payload: { player } }, (response) => {
            setCardState(response);
        });
        setShowCards(true);
    };


    return (
        <div style={{ position: 'relative', width: barWidth, height: barHeight }}>
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: 25,
                    background: colour,
                    overflow: 'hidden',
                    position: 'relative',
                }}
            >
                <CardStack
                    player={player}
                    onClick={openCards}
                />

                <span
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'black',
                        fontWeight: 'bold',
                        pointerEvents: 'none',
                    }}
                >
                    {text}
                </span>

                <div style={{ position: "absolute", right: 0, top: 0 }}>
                    <PhaseIcon phase={phase} />
                </div>
            </div>

            <CardPopUp
                visible={showCards}
                colour={player.colour}
                onConfirm={() => setShowCards(false)}
                value = {results?.value}
                checkout = {results?.checkOut}
                removeCards = {results?.removeCards}
                player = {player}
                phase = {phase}
            />
        </div>
    );
}
