import { Height } from 'devextreme-react/cjs/chart';
import React from 'react';
import playingCards from "../images/playingCards.jpg";
export default function CardStack({player, onClick}){
    const length = player.cards.length ?? 0
    //image of cards for game bar
    return(
        <div 
            style={{ width: 50,
                height: 50,
                borderRadius: "50%",
                background: "white",
                position: "relative",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 0 5px rgba(0,0,0,0.2)",
                cursor: "pointer"}}
            onClick={onClick}
        >
            <img
                src = {playingCards}
                
                style = {{
                width: 40,
                height: 40,
                objectFit: 'cover'
                }}
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
                    pointerEvents: 'none'
                }}
            >
                {length}
            </span>
        </div>
    );
}