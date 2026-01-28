import { useEffect, useState } from "react";

export default function Clock(){
    const [time, setTime] = useState(45);

    useEffect(() => {
        if (time == 0){
            return 
        }
        const timer = setInterval(() => {
        setTime(s => s - 1)}, 1000);
        return () => clearInterval(timer);
    }, [time]);
 
        return(
        <div 
            style={{ width: 60,
                height: 60,
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