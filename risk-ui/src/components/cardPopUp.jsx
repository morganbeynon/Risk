import React from 'react';
import { GameEngine, Player } from 'risk-game';

export default function cardPopUp({onConfirm, colour, visible}){
    if (!visible) return null;
    const engine = window.GameEngine;
    const player = engine.getCurrentPlayer();
    const phase = engine.getPhase()
    let text = ""
    const handleConfirm = () => {
        const numAmount = parseInt(amount);
        if (!isNaN(numAmount) && numAmount <= validAmount && numAmount > 0) {
                onConfirm(numAmount);
                setAmount(""); 
        } else {
        alert("Enter a valid number");
        }
    };

    if (phase == "Deploy"){
        text = "You must have three of a kind or one of each to redeem cards"
    }
    else if(phase == "Attack"){
        text = "You can only redeem cards whilst in the deploy phase"
    }
    else{
        text = "You can only redeem cards whilst in the deploy phase"
    }


    return(
        
        <div 
        style = {{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
        }} >
            <div
            style= {{
                width: 300,
                height: 100,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                background: "white",
                borderRadius: 15,
                gap: "10px",
                padding: 20
            }}
            >
                <span style={{
                    fontWeight: "bold",
                    textAlign: "center",
                    color: "black"
                        
                    }}
                >
                    {text}
                </span>
                <input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                style={{
                    background: "white",
                    width: 50,
                    height: 35,
                    fontSize: 18,
                    textAlign: "center",
                    fontWeight: "bold",
                }}></input>
                <button
                style={{
                    background: colour,
                }}
                onClick={handleConfirm}
                >
                    Redeem Cards
                    </button>
            </div>
        </div>
    )
}