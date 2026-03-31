
import React from 'react';


export default function TroopInput({phase, onConfirm, colour, visible, validAmount, onClose}){
    if (!visible) return null;
    const [amount, setAmount] = React.useState("") 

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

    const closeOverlay = () => {
        onClose()
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
                position: "relative",
                width: 400,
                height: 150,
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
                <button
                    onClick={closeOverlay}
                    style={{
                        position: "absolute",
                        top: 10,
                        right: 5,
                        background: "transparent",
                        border: "none",
                        fontSize: 18,
                        fontWeight: "bold",
                        cursor: "pointer",
                        color: "red"
                    }}
                >
                        ×
                </button>
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