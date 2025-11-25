import React from 'react';

export default function TerritoryCell({colour,troopCount, id, onClick, selected}){
    let border = null
    if (selected){
        border = "3px solid black"
    }
    else{
        border = null;
    }
    return(
        <div
            onClick={onClick}
            style = {{
                background: colour,
                width: 30,
                height: 30,
                position: 'relative',
                border:  border
            }}
            
        >
            <span
            style= {{
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
                    display: 'flex'
            }}>
                {troopCount}

            </span>

        </div>
    );
}