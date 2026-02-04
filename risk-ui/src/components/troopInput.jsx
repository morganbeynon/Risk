
import React from 'react';


export default function TroopInput({engine, onConfirm, colour, visible, validAmount}){
    if (!visible) return null;
    const [amount, setAmount] = React.useState("")
    const engine = engine  
    const player = engine.applyAction("getCurrentPlayer");
    const phase = engine.applyAction("getPhase")
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
        text = `You have ${validAmount} troops to deploy`
    }
    else if(phase == "Attack"){
        text = `Success! You have ${validAmount} troops to move`
    }
    else{
        text = `You can move ${validAmount} troops`
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
                    Place
                    </button>
            </div>
        </div>
    )
}