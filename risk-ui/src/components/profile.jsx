import React from 'react';

export default function Profile({colour, name}){
    return(
        <div
            style={{display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center"}}
        >
            <div
            style={{
                height: 50,
                width: 50,
                borderRadius: "50%",
                background: colour
            }}   
            /> 
            <span 
                style={{fontSize: 14, marginTop: 5}}
            >
                {name}
            </span>
        </div>
    )
}
