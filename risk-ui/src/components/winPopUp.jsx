import React from 'react';

export default function WinPopUp({ visible, winner, onConfirm }) {
    if (!visible || !winner) return null;

    return (
        <div
            style={{
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
            }}
        >
            <div
                style={{
                    width: 300,
                    height: 120,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "white",
                    borderRadius: 15,
                    gap: "15px",
                    padding: 20,
                }}
            >
                <span
                    style={{
                        fontWeight: "bold",
                        textAlign: "center",
                        color: "black",
                    }}
                >
                    {winner.id} won!
                </span>

                <button
                    style={{
                        background: winner.colour,
                    }}
                    onClick={onConfirm}
                >
                    Play Again
                </button>
            </div>
        </div>
    );
}
