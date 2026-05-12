import React from 'react';

export default function Profile({colour, name, beat}){
    
    return(
        <div
            style={{display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center"}}
        >
            
            <div
            style={{
                position: "relative",
                height: 50,
                width: 50,
                borderRadius: "50%",
                background: colour
            }}   
            >
                {beat && (
                    <svg
                        //red X through beaten players
                        viewBox="0 0 50 50"
                        style={{ position: "absolute", top: 0, left: 0, width: 50, height: 50 }}
                    >
                        
                        <line x1="8" y1="8" x2="42" y2="42" stroke="black" strokeWidth="6" strokeLinecap="round"/>
                        <line x1="42" y1="8" x2="8" y2="42" stroke="black" strokeWidth="6" strokeLinecap="round"/>
                    </svg>
                )}
            </div> 
            <span 
                style={{fontSize: 14, 
                    marginTop: 5,
                    color: "white"}}
            >
                {name}
            </span>
        </div>
    )
}
