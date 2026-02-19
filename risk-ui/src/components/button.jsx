import React, {forwardRef, useState, useEffect } from "react";

export default function Button({visible, colour, onClick}){
    const bHeight = 50
    const bWidth = 100
    let cursor = ""
    let visibility = ""
    if (visible){
        cursor = "pointer"
        visibility = "visible"
    }
    else{
        cursor = "not-allowed"
        visibility = "hidden"
    }
    return(
        <button
            onClick={onClick}
            style = {{
                background: colour,
                width: bWidth,
                height: bHeight,
                borderRadius: 10,
                border: "none",
                color: "black",
                fontWeight: "bold",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 16,
                cursor: cursor,
                visibility: visibility
            }}   
        >
                {"Next Phase"}
        </button>
    );
}