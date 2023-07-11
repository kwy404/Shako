import { useState, useEffect } from "react";

import { Link } from "react-router-dom";

declare global {
    interface Window {
        MyNamespace: any;
    }
}

import { io, Socket } from "socket.io-client";
var socket: Socket;

function Header({ user }: any) {
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        setTimeout(() => {
            socket = io("localhost:9090");
            setTimeout(() => {
                emited({}, "connected", socket);
            }, 1000);
            socket.on("connected", (message: any) => {
                setLoading(true);
            });
        }, 1000);
    }, []);

    const emited = (data: any, type: any, socket: any) => {
        socket.emit("message", {
            data: {
                type: type,
                receive: data,
                token: window.localStorage.getItem("token"),
            },
        });
    };

    return (
        <div className="Header">
            <h1>Isso aqui é um header</h1>
        </div>
    );
}

export default Header;
