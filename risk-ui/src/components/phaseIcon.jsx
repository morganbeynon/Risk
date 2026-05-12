import parachuteSoldier from "../images/parachuteSoldier.png";
import shootingSoldier from "../images/shootingSoldier.png";
import pointingSoldier from "../images/pointingSoldier.png";
export default function PhaseIcon({phase}){
    let src = null
    //Specific phase image
    if (phase == "Deploy"){
        src = parachuteSoldier
    }
    else if(phase == "Attack"){
        src = shootingSoldier
    }
    else{
        src = pointingSoldier
    }
    
    return(
        <div 
            style={{ width: 50,
                height: 50,
                borderRadius: "50%",
                background: "white",
                position: "relative",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 0 5px rgba(0,0,0,0.2)",
                cursor: "pointer"}}
        >
            <img
                src = {src}
                
                style = {{
                width: 35,
                height: 35,
                
                }}
            />
        </div>
    )
}