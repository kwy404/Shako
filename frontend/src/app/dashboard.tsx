import { useState, useEffect } from "react";
// Webpack CSS import
import 'onsenui/css/onsenui.css';
import 'onsenui/css/onsen-css-components.css';
import Loading from "./loading";
import Online from "../ws/ping";

import { Link } from "react-router-dom";
import Header from "./header";

const typePage = "dashboard";

declare global {
    interface Window {
        MyNamespace: any;
    }
}

import { io, Socket } from "socket.io-client";
var socket: Socket;

function Dashboard({ user }: any) {
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
        <div className="App">
            {loading ? (
                <>
                    <Header user={user}></Header>
                    <Online user={user} socket={socket} emited={emited} />
                </>
            ) : (
                <Loading/>
            )}
        </div>
    );
}

export default Dashboard;
