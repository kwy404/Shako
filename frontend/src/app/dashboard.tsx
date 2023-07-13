import { useState, useEffect, useRef } from "react";
import 'onsenui/css/onsenui.css';
import 'onsenui/css/onsen-css-components.css';
import Loading from "./loading";
import Online from "../ws/ping";
import { Link, useParams, useLocation } from "react-router-dom";
import Header from "./header";
import Left from "./left";
import { io, Socket } from "socket.io-client";
import Profile from "./profile";

declare global {
    interface Window {
        MyNamespace: any;
    }
}

let socket: Socket | null = null;

function Dashboard({ user, isProfile }: any) {
    const params = useParams<{ username?: string; discrimination?: string }>();
    const location = useLocation();
    const [loading, setLoading] = useState(false);
    const initialMount = useRef(true);

    useEffect(() => {
        if (!socket) {
            socket = io("localhost:9090");
            setTimeout(() => {
                emited({}, "connected", socket!);
            }, 1000);
        }

        socket.on("connected", (message: any) => {
            setLoading(true);
            isProfileTitle();
        });
        
        return () => {
            // Mantenha a conexão aberta se for a primeira montagem ou se o componente estiver sendo desmontado
            if (initialMount.current || !socket) {
                return;
            }
            
            // Remova apenas os ouvintes do socket
            socket.off("connected");
        };
    }, []);

    useEffect(() => {
        isProfileTitle();
    }, [location.pathname])

    const isProfileTitle = () => {
        if (isProfile) {
            window.document.title = `${params?.username} (u/${params?.username}/${params?.discrimination} - Shako)`;
        }
    }

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
        <div className="dashboard">
            {loading ? (
                <>
                    <Header user={user} />
                    <Online user={user} socket={socket!} emited={emited} />
                </>
            ) : (
                <>
                    <Header user={user} />
                    <Loading />
                </>
            )}
            {params?.username && params?.discrimination && (
                <div className="container">
                    <div className="center">
                       <Left>
                            
                       </Left>
                       <Profile params={params} socket={socket} emited={emited} user={user}/>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Dashboard;
