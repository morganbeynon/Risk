export default function TurnBar({currentPlayer, colour, screenPlayer}){
    const tHeight = 50;
    const tWidth = 200;
    let text = ""
    console.log(currentPlayer.id)
    //handle differing players text
    if (currentPlayer.id == screenPlayer){
        text = "Your Turn"
    }
    else{
        text = `${currentPlayer.id}'s Turn`
        
    }
    return (
        <div
            style={{
                width: tWidth,
                height: tHeight,
                borderRadius: 25,
                background: colour,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold",
                color: "black"
            }}
        >
            {text}
        </div>
    );
}