import React from 'react';

export default function TerritoryCell({colour, onClick}){
    return(
        <div
            onClick={onClick}
            style = {{
                background: colour,
                width: 30,
                height: 30

            }}
        />
    );
}