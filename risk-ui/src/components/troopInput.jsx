
import React from 'react';
import { GameEngine, Player } from 'risk-game';

export default function TroopInput({onConfirm, colour, visible, validAmount}){
    if (!visible) return null;
    const [amount, setAmount] = React.useState("")
    const engine = window.GameEngine;
    const player = engine.getCurrentPlayer();
    const handleConfirm = () => {
        const numAmount = parseInt(amount);
        if (!isNaN(numAmount) && numAmount < validAmount+1) {
                onConfirm(numAmount);
                setAmount(""); 
        } else {
        alert("Enter a valid number");
        }
    };
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
                width: 100,
                height: 100,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                background: "white",
                borderRadius: 15,
                gap: "10px",
            }}
            >
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
                    Place
                    </button>
            </div>
        </div>
    )
}