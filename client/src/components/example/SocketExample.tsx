import { io } from "socket.io-client";
import { useEffect, useState } from "react";

function SocketExample() {

    const [time, setTime] = useState('fetching')
    useEffect(() => {
        const socket = io('http://192.168.50.113:5001');

        // socket.on('connect', () => console.log("client connected", socket.id));
        socket.on('connect_error', () => {
            setTimeout(() => socket.connect(), 5000);
        });
        socket.on('time', (data) => setTime(data))
        socket.on('disconnect', () => setTime('server disconnected'));
    }, []);

    return (
        <div className ="">
            {time}
        </div>
    )
    
}

export default SocketExample;