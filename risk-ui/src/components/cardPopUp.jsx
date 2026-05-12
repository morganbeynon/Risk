import React from 'react';
import shootingSoldierImage from "../images/shootingSoldier.png";
import calvaryImage from "../images/calvary.png";
import tankImage from "../images/tank.png";
import socket from '../socket';



export default function cardPopUp({onConfirm, colour, visible, value, checkout, removeCards, player, phase}){
    if (!visible) return null;
    let text = ""
    let buttonColour = "grey"
    let cursor = "not-allowed"
    let opacity = 0.5
    //trigger redemption if checkout available
    const handleConfirm = () => {
        if (checkout){
            const troops = Number(value);
            if (Number.isNaN(troops)){
                console.log("returned troops")
                return;
            } 
            socket.emit("player-action", { action: "redeemCards", payload: {player} });
            onConfirm();

        }
        else{
            console.log("failed checkout")
            return
        }
    };
    //close the overlay if x is pressed.
    const closeOverlay = () => {
        onConfirm();
    }
    const cardImages = {
        "Soldier": shootingSoldierImage,
        "Cavalry": calvaryImage,
        "Tank": tankImage,
    };
    //phase dependant text.
    if (phase == "Deploy"){
        text = "You must have three of a kind or one of each to redeem cards"
    }
    else{
        text = "You can only redeem cards whilst in the deploy phase"
    }
    if (checkout && phase == "Deploy"){
        buttonColour = "green"
        cursor = "pointer"
        opacity = 1
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
                width: 600,
                height: 500,
                position: "relative",
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
                        top: 8,
                        right: 12,
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
                <div
                    style={{
                        width: "100%",
                        display: "flex",
                        flexWrap: "wrap",
                        justifyContent: "center",
                    }}
                    //Display cards if user has any, if not adequate text presented.
                >
                    
                    {player.cards.length === 0 ? (
                        <span style={{ color: "black", fontSize: 14 }}>
                            No cards
                        </span>
                    ) : (
                        player.cards.map(card => {
                            const imgSrc = cardImages[card.type];
                            let terrText = ""
                            if (player.territories.includes(card.territoryID)){
                                terrText =  "Your Territory\n+2 troops"
                            }
                            else{
                                terrText = "Enemy Territory"
                            }
                                
                            return (
                                <div
                                    key={card.id}
                                    style={{
                                        position: "relative",
                                        width: 120,
                                        height: 160,
                                        margin: 10,
                                        borderRadius: 12,
                                        background: "white",
                                        boxShadow: "0 4px 8px rgba(0,0,0,0.7)",
                                        border: "2px solid #000000",
                                    }}
                                >

                                    {imgSrc && (
                                        <img
                                            src={imgSrc}
                                            alt={card.type}
                                            style={{
                                                position: "absolute",
                                                top: 35,
                                                left: "50%",
                                                transform: "translateX(-50%)",
                                                width: 60,
                                                height: 60,
                                                objectFit: "contain",
                                            }}
                                        />
                                    )}

                                <div
                                    style={{
                                        position: "absolute",
                                        bottom: 35,
                                        width: "100%",
                                        textAlign: "center",
                                        fontSize: 12,
                                        fontWeight: "bold",
                                        color: "black",
                                    }}
                                >
                                    {terrText}
                                </div>
                            
                                </div>
                            );
                        })

                    )}
                </div>

                <button
                style={{
                    background: buttonColour,
                    cursor: cursor,
                    opacity: opacity,
                    border: "2px solid #000000"
                }}
                onClick={handleConfirm}
                >
                    Redeem Cards
                    </button>
            </div>
        </div>
    )
}