import React, {forwardRef, useState, useEffect } from "react";

const button = forwardRef(
    (
            {
    onclick,
    title,
    width= 115,
    height = 48,
    borderRadius = 5,
    buttonStyle = "",
    textStyle = "",
    positionStyle = "",
    },
    ref
) => {
    return (
        <button
        ref = {ref}
        onClick = {onclick}
        style = {{width, height, borderRadius}}
        className={`bg-gray-300 px-4 py-2 text-black text-center font-medium hover:bg-gray-400 active:scale-95 transition rounded 
          ${buttonStyle} ${positionStyle}`}
        >
            <span className={textStyle}>{title}</span>  
        </button>
            
    )
}
)

export default button;