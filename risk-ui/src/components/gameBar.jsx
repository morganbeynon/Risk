import React from 'react'
import CardStack from './cardStack'
import PhaseIcon from './phaseIcon';

export default function GameBar({players}){
    const barWidth = 300;
    const barHeight = 50;
    return(
        <div style={{ position: 'relative', width: barWidth, height: barHeight }}>
            <div style={{ position: 'relative',
                width: '100%',
                height: '100%',
                borderRadius: 25,
                background: 'grey',
                overflow: 'hidden',
                position: 'relative',}}>
            
               <div style={{ position: "absolute", left: 0, top: 0 }}>
                    <CardStack player={players[0]} onClick={() => alert("Cards Clicked")} />
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
                    {"TESTING"}
                </span>
                <div style={{position: "absolute", right: 0, top: 0, img: 'cover'}}>
                    <PhaseIcon phase = {"Reinforce"}/>
                </div>
            </div>
        </div>
    )
}