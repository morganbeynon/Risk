import React from 'react';
import Profile from "./profile"

export default function ProfileStack({playerList}){
    const names = []
    const colours = []
    const beaten = []
    for (const player of playerList){
        names.push(player.id)
        colours.push(player.colour)
        beaten.push(player.beat)
    }
    return(
        <div
            style={{display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            <div>
                
                {names.map((name, i) => (
                    //map each profile to a position in stack.
                    <Profile name = {name} colour = {colours[i]} beat = {beaten[i]}/>
                ))}
            </div>
        </div>
    )
}
