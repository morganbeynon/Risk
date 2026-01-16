import React from 'react'
import CardStack from './cardStack'
import PhaseIcon from './phaseIcon';
import CardPopUp from './cardPopUp';

export default function GameBar({ player, phase }) {
    const barWidth = 300;
    const barHeight = 50;
    const colour = player.colour;

    const [showCards, setShowCards] = React.useState(false);

    let text = "";
    if (phase === 'Deploy') {
        text = `Deploy ${player.deployableTroops} Troops`;
    } else if (phase === 'Attack') {
        text = "Attack";
    } else {
        text = "Reinforce";
    }

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
                    onClick={() => setShowCards(true)}
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
            />
        </div>
    );
}
