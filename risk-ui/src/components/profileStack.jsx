import React from 'react';
import Profile from "./profile"

export default function ProfileStack({playerList}){
    const names = []
    const colours = []
    for (const player of playerList){
        names.push(player.id)
        colours.push(player.colour)
    }
    return(
        <div
            style={{display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center"}}
        >
            <div>
                {names.map((name, i) => (
                    <Profile name = {name} colour = {colours[i]}/>
                ))}
            </div>
        </div>
    )
}
