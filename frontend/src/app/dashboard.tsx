import { useState, useEffect, useRef } from "react";
import 'onsenui/css/onsenui.css';
import 'onsenui/css/onsen-css-components.css';
import Loading from "./loading";
import Online from "../ws/ping";
import {  useParams } from "react-router-dom";
import Header from "./header";
import Left from "./left";
import { io, Socket } from "socket.io-client";
import Profile from "./profile";
import { Helmet } from 'react-helmet';
import './dashboard.css';
import Notification from "../components/Notification";
import defaultAvatar from "../resources/images/default_avatar.webp";
import ChatComponent from "../components/Chat";
import CardUser from "../components/CardUser";
import InterestsModal from "../components/Interests";

// Audio notification
const notificationAudio = new Audio(`${window.location.origin}/resources/audio/notification.mp3`);

declare global {
    interface Window {
        MyNamespace: any;
    }
}

let socket: Socket | null = null;
let socketSpotfiy: Socket | null = null;

interface NotificationData {
  id: string;
  message: string;
  senderName: string;
  senderAvatar: string;
}

function Dashboard({ user, isProfile, setUser }: any) {
    const params = useParams<{ username?: string; discrimination?: string; user_id?: string; }>();
    const [loading, setLoading] = useState(false);
    const [loadingSuggestUsers, setLoadingSuggestUsers] = useState(true);
    const initialMount = useRef(true);
    const [notifications, setNotifications] = useState<NotificationData[]>([]);
    const [suggestUsers, setSuggestedUsers] = useState([]);
    const [emissionTime, setEmissionTime] = useState<number | null>(null);
    const [connectionTime, setConnectionTime] = useState<number | null>(null);

    const handleAddNotification = (id: any, message: any, senderName: any, senderAvatar: any) => {
      const newNotification: NotificationData = {
        id,
        message: message,
        senderName: senderName,
        senderAvatar: senderAvatar,
      };
  
      setNotifications([...notifications, newNotification]);
      notificationAudio.play();
    };

    useEffect(() => {
      const initialMount = { current: true };
  
      const initSocket = () => {
        const startTime = Date.now();
        if (!socket) {
          let emissionStartTime = Date.now();
          socket = io("localhost:9091");
  
          setTimeout(() => {
            emissionStartTime = Date.now();
            emited({}, "connected", socket!);
            setEmissionTime(Date.now() - emissionStartTime);
            emited({ token: window.localStorage.getItem('token') || '' }, 'suggestedUsers', socket);
          }, 1000);
        } else {
          setLoading(true);
        }
  
        socket.on("connected", (message: any) => {
          const endTime = Date.now();
          setConnectionTime(endTime - startTime);
          setLoading(true);
          console.log(`%c[FAST CONNECT] connected in ${endTime - startTime}ms`, 'color: purple;');
        });
  
        socket.on("profile", (message: any) => {
          if (message.type === 'profileBanned') {
            if (message.user === user.id) {
              window.location.pathname = "/login";
            }
          }
        });
  
        socket.on("suggestedUsers", (data: any) => {
          const endTime = Date.now();
          setConnectionTime(endTime - startTime);
          setSuggestedUsers(data.users);
          setLoadingSuggestUsers(false);
          console.log(`%c[FAST CONNECT] loaded suggestion users in ${endTime - startTime}ms`, 'color: purple;');
        });
  
        socket.on("notification", (message: any) => {
          handleAddNotification(message.id, message.message, message.user.username, message.user.avatar);
        });
      };
  
      initSocket();
  
      return () => {
        // Mantenha a conexão aberta se for a primeira montagem ou se o componente estiver sendo desmontado
        if (initialMount.current || !socket) {
          return;
        }
  
        // Remova apenas os ouvintes do socket
        socket.off("connected");
        socket.off("profile");
        socket.off("notification");
        socket.off("suggestedUsers");
        if (socket) {
          socket.disconnect();
        }
      };
    }, [socket]);

    const emited = (data: any, type: any, socketInstance: any) => {
      socketInstance.emit("message", {
        data: {
          type: type,
          receive: data,
          token: window.localStorage.getItem("token"),
        },
      });
    };

    useEffect(() => {
        socketSpotfiy = io("localhost:4100");
        setTimeout(() => {
            emited({}, "connected", socketSpotfiy!);
        }, 1000);

        socketSpotfiy.on("currentSong", (song: any) => {
            if(song.isPlaying){
              console.log(`%c[Spotify] CurrentSong ${song.name} - by ${song.artists[0].name}`, 'color: purple;');
            } else{
              console.log(`%c[Spotify] CurrentSong None`, 'color: purple;');
            }
            const oldProfile = {...user};
            oldProfile.spotify_object = song.current_song;
            setUser(oldProfile);
        })
      }, []);

    const handleCloseNotification = (id: string) => {
      setNotifications(notifications.filter((notification) => notification.id !== id));
    };
    
    return (
        <div className="dashboard">
            {loading ? (
                <>
                    <Header user={user} emited={emited} setUser={() => {}} socket={socket}/>
                    {/* <Online user={user} socket={socket!} emited={emited} /> */}
                    <div className="notifications">
                      {notifications.map((notification) => (
                        <Notification
                          key={notification.id}
                          id={notification.id}
                          message={notification.message}
                          senderName={notification.senderName}
                          senderAvatar={notification.senderAvatar}
                          onClose={handleCloseNotification}
                        />
                      ))}
                    </div>
                </>
            ) : (
                <>
                    <Loading />
                    <Header user={user} emited={emited} setUser={() => {}} socket={socket} />
                </>
            )}
            {/* Chat component here */}
            { user?.username && <ChatComponent user={user} emited={emited} setUser={() => {}} socket={socket}/> } 
            {/* End chat component here */}
            {params?.username && params?.discrimination && params?.user_id ? <>
                    <div className="container">
                        <div className="center">
                        <Left user={user}>
                          <CardUser user={user}/>
                        </Left>
                        <Profile setUser={setUser} params={params} socket={socket} emited={emited} user={user}/>
                        </div>
                    </div>
            </> : <>
            {<>
                <div className="container">
                  { !user.selectedInterests && user?.username && <InterestsModal isOpen={true} emited={emited} socket={socket}/>}
                    <div className="center home">
                        <Left user={user}>
                          {user?.username && <CardUser user={user}/>}
                        </Left>
                        <div className="Profile fullScreen">
                            <h3>Recommended profiles</h3>
                            {/* Perfil recomendados */}
                            <div className="scroll-x">
                            {user?.username ? loadingSuggestUsers ? <Loading/> : <>
                              {suggestUsers.length > 0 && suggestUsers.map((user: any) => (
                                <CardUser user={user}/>
                              ))}
                            </> : <><h3 style={{opacity: '0.8', textTransform: 'uppercase'}}>You can see this, please make login</h3></>}
                            </div>
                            {/* end Perfil recomendado */}
                            {user?.username && <div className="feed">
                                <div className="post_">
                                  <div className="text_area">
                                    <img className="avatar" src={`${user?.avatar ? user?.avatar : defaultAvatar}`}/>
                                    <textarea placeholder="Create a post"></textarea>
                                  </div>
                                </div>
                            </div>}
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
