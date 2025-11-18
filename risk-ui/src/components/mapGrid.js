import React from 'react'

export default function gameBoard(){
    rows = 10;
    cols = 10;
    cellSize = 30;
    return(
        <div
            style = {{
                display: "grid",
                gridTemplateColumns: `repeat(${cols}, 40px)`,
                gap: "4px",
            }}
        >
            {Array.from({ length: rows * cols}).map((_, i) => (
                for (const player in players){
                    if player.territories.contains([rows,cols])
                }
                <div
                    key = {i}
                    onClick={() => alert("Clicked cell " + i)}
                    style = {{
                        width: 30,
                        height: 30,
                        display: "flex"

                    }}
                >
                    {i}
                
                </div>
            ))}
        </div>
    )
}
