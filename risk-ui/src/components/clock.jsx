import { useEffect, useState } from "react";

export default function Clock({alarm}){
    const [time, setTime] = useState(30);

    useEffect(() => {
        if (time == 0){
            alarm?.();
            return 
        }
        const timer = setInterval(() => {
        setTime(s => s - 1)}, 1000);
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