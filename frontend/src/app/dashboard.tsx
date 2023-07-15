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
import { Helmet } from 'react-helmet';

declare global {
    interface Window {
        MyNamespace: any;
    }
}

let socket: Socket | null = null;

function Dashboard({ user, isProfile, setUser }: any) {
    const params = useParams<{ username?: string; discrimination?: string }>();
    const [loading, setLoading] = useState(false);
    const initialMount = useRef(true);

    useEffect(() => {
        if (!socket) {
            socket = io("localhost:9090");
            setTimeout(() => {
                emited({}, "connected", socket!);
            }, 1000);
        } else{
            setLoading(true);
        }

        socket.on("connected", (message: any) => {
            setLoading(true);
        });

        socket.on("profile", (message: any) => {
            if(message.type == 'profileBanned'){
                if(message.user == user.id){
                    window.location.pathname = "/login"
                }
            }
        })

        return () => {
            // Mantenha a conexão aberta se for a primeira montagem ou se o componente estiver sendo desmontado
            if (initialMount.current || !socket) {
                return;
            }
            
            // Remova apenas os ouvintes do socket
            socket.off("connected");
        };
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
        <div className="dashboard">
            {loading ? (
                <>
                    <Header user={user} emited={emited} setUser={() => {}} socket={socket}/>
                    <Online user={user} socket={socket!} emited={emited} />
                </>
            ) : (
                <>
                    <Loading />
                    <Header user={user} emited={emited} setUser={() => {}}  socket={socket} />
                </>
            )}
            {params?.username && params?.discrimination ? <>
                    <div className="container">
                        <div className="center">
                        <Left>
                        </Left>
                        <Profile setUser={setUser} params={params} socket={socket} emited={emited} user={user}/>
                        </div>
                    </div>
            </> : <>
            {user?.username && <>
                <div className="container">
                    <div className="center">
                        <Left>
                        </Left>
                        <div className="Profile fullScreen">
                            <div className="feed">
                                <h1>Home</h1>
                            </div>
                        </div>
                    </div>
                </div>
            </>}
            <Helmet>
                <meta charSet="utf-8" />
                <title>Shako</title>
            </Helmet>
            </>}
        </div>
    );
}

export default Dashboard;
