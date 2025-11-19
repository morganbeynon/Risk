import React, {forwardRef, useState, useEffect } from "react";

export default function Button({colour, onClick}){
    const bHeight = 50
    const bWidth = 100
    return(
        <button
            onClick={onClick}
            style = {{
                background: colour,
                width: bWidth,
                height: bHeight,
                borderRadius: 10,
                border: "none",
                color: "white",
                fontWeight: "bold",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 16,
            }}   
        >
                {"Next Phase"}
        </button>
    );
}