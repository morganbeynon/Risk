import { useEffect, useState } from "react";

export default function Clock({endTime, winner}){
    const [time, setTime] = useState(0);
    //check for winner and calculate turn time using current time
    useEffect(() => {
        if (winner) return;
        const calculateTime = () => {
            const now = Date.now();
            const diff = Math.max(0, Math.ceil((endTime - now) / 1000));
            setTime(diff);
        };
        calculateTime()
        //clear timer and set new value
        const timer = setInterval(calculateTime, 1000);
        return () => clearInterval(timer);
    }, [time]);
 
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
                boxShadow: "0 0 5px rgba(0,0,0,0.2)",}
            }
        >
            <span
                style={{
                    color: 'black',
                    fontWeight: 'bold',
                }}
            >
                {time}
            </span>
        </div>
    );
}

