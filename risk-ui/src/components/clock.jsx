import { useEffect, useState } from "react";

export default function Clock({endTime}){
    const [time, setTime] = useState(0);

    useEffect(() => {
        const calculateTime = () => {
            const now = Date.now();
            const diff = Math.max(0, Math.ceil((endTime - now) / 1000));
            setTime(diff);
        };
        calculateTime()

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

// Node.js Foundation. 
// "The Node.js Event Loop, Timers, and process.nextTick()."
// Technical Detail: 
// This explains how Node.js handles non-blocking I/O and why setTimeout 
// is preferred over a busy-wait loop for game turns.