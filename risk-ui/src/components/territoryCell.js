import React from 'react';

export default function territoryCell(player){
    background =  player?.colour || 'grey'
    return(
        <div
            onClick={onClick}
            style = {{
                background,
                width: 30,
                height: 30

            }}
        />
    );
}