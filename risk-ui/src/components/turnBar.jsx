export default function TurnBar({colour}){
    const tHeight = 50;
    const tWidth = 200;

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
            Your Turn
        </div>
    );
}