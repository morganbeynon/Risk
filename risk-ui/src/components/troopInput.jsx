
import React from 'react';

export default function TroopInput({onClick, colour}){
    return(
        <div
        style= {{
            width: 100,
            height: 100,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "white",
            borderRadius: 15,
            gap: "10px"
        }}
        >
            <input
            style={{
                background: "white",
                width: 50,
                height: 35,
                fontSize: 18,
                textAlign: "center",
                fontWeight: "bold"
            }}></input>
            <button
            style={{
                background: colour,
            }}
            onClick={onClick}
            >
                Place
                </button>
        </div>
    )
}