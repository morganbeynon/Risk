import React from 'react'
import CardStack from './cardStack'
import PhaseIcon from './phaseIcon';

export default function GameBar({player, phase} ){
    const barWidth = 300;
    const barHeight = 50;
    const colour = player.colour
    let text = ""
    if (phase == 'Deploy'){
        text = `Deploy ${player.deployableTroops} Troops`
    }
    else if (phase == 'Attack'){
        text = "Attack"
    }
    else{
        text = "Reinforce"
    }
    return(
        <div style={{ position: 'relative', width: barWidth, height: barHeight }}>
            <div style={{ position: 'relative',
                width: '100%',
                height: '100%',
                borderRadius: 25,
                background: colour,
                overflow: 'hidden',
                position: 'relative',}}>
            
               <div style={{ position: "absolute", left: 0, top: 0 }}>
                    <CardStack player={player} onClick={() => alert("Cards Clicked")} />
                </div>
                
                <span style={{
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
                        pointerEvents: 'none'
                    }}
                >
                    {text}
                </span>
                <div style={{position: "absolute", right: 0, top: 0, img: 'cover'}}>
                    <PhaseIcon phase = {phase}/>
                </div>
            </div>
        </div>
    )
}