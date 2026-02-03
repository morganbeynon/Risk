import React from 'react'
import CardStack from './cardStack'
import PhaseIcon from './phaseIcon';
import CardPopUp from './cardPopUp';
import { GameEngine, Player, Territory,Continent } from 'risk-game';

export default function GameBar({ player, phase}) {
    const barWidth = 300;
    const barHeight = 50;
    const colour = player.colour;
    const engine = window.GameEngine
    const [showCards, setShowCards] = React.useState(false);
    const [cardState, setCardState] = useState(null);


    let text = "";
    if (phase === 'Deploy') {
        text = `Deploy ${player.deployableTroops} Troops`;
    } else if (phase === 'Attack') {
        text = "Attack";
    } else {
        text = "Reinforce";
    }

    const openCards = () => {
        setCardState(engine.applyAction("checkCards", { player }));
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
                value = {value}
                checkout = {checkOut}
                removeCards = {removeCards}
                
            />
        </div>
    );
}
