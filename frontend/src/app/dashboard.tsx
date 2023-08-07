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
import { Buffer } from 'buffer';
import axios from 'axios';
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
        if (!socket) {
            socket = io("localhost:9091");
            setTimeout(() => {
                emited({}, "connected", socket!);
                emited({ token: window.localStorage.getItem('token') ? window.localStorage.getItem('token') : ''}, 'suggestedUsers', socket);
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

        socket.on("suggestedUsers", (data: any) => {
          setSuggestedUsers(data.users)
          setLoadingSuggestUsers(false);
        })

        socket.on("notification", (message: any) => {
          handleAddNotification(message.id, message.message, message.user.username, message.user.avatar)
        })

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
        };
    }, []);

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
            const oldProfile = {...user};
            oldProfile.spotify_object = song.current_song;
            setUser(oldProfile);
        })

        const spotifyCall = async (code: any) => {
            try {
              const clientId = 'dcbdff61d5a443afaba5b0b242893915';
              const clientSecret = '974c25e65efa4a9a8094be3ab4a1eb28';
              const params = new URLSearchParams();
              params.append('grant_type', 'authorization_code');
              params.append('code', code);
              params.append('redirect_uri', 'http://localhost:5173/spotify');
          
              const config = {
                headers: {
                  'Content-Type': 'application/x-www-form-urlencoded',
                  Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
                },
              };
          
              try {
                const response = await axios.post('https://accounts.spotify.com/api/token', params, config);
                const access_token = response.data.access_token
                const refresh_token = response.data.refresh_token // Obtenha o token de atualização do response
                if (access_token) {
                  if (!socket) {
                    return;
                  }
                  socket.emit("message", {
                    data: {
                      type: 'spotify',
                      receive: { 'access_token': access_token, 'spotify_refresh_token': refresh_token, 'code': code, token: window.localStorage.getItem("token") }
                    },
                  });
                }
              } catch (error: any) {
                if (error.response && error.response.status === 401) {
                  // O token expirou, então solicite um novo usando o token de atualização
                  const refreshTokenParams = new URLSearchParams();
                  refreshTokenParams.append('grant_type', 'refresh_token');
                  refreshTokenParams.append('refresh_token', user?.spotify_refresh_token);
                  refreshTokenParams.append('client_id', clientId);
          
                  try {
                    const refreshTokenResponse = await axios.post('https://accounts.spotify.com/api/token', refreshTokenParams, config);
                    const newAccessToken = refreshTokenResponse.data.access_token;
                    if(!socket){
                      return;
                    }
                    socket.emit("message", {
                      data: {
                        type: 'spotify',
                        receive: { 'access_token': newAccessToken, 'spotify_refresh_token': user?.spotify_refresh_token, token: window.localStorage.getItem("token") }
                      },
                    });
          
                    // Faça algo com o novo token de acesso
          
                  } catch (refreshTokenError) {
                    //
                  }
                }
              }
            } catch (error) {
              console.error('Error:', error);
            }
        };          
    
        if(window.location.search.split("code=")[1]){
            spotifyCall(window.location.search.split("code=")[1]);
        }
        
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
            <ChatComponent user={user} emited={emited} setUser={() => {}} socket={socket}/>
            {/* End chat component here */}
            {params?.username && params?.discrimination && params?.user_id ? <>
                    <div className="container">
                        <div className="center">
                        <Left user={user}>
                          
                        </Left>
                        <Profile setUser={setUser} params={params} socket={socket} emited={emited} user={user}/>
                        </div>
                    </div>
            </> : <>
            {user?.username && <>
                <div className="container">
                  { !user.selectedInterests && <InterestsModal isOpen={true} emited={emited} socket={socket}/>}
                  
                    <div className="center home">
                        <Left user={user}>
                          <CardUser user={user}/>
                        </Left>
                        <div className="Profile fullScreen">
                            <h3>Recommended profiles</h3>
                            {/* Perfil recomendados */}
                            <div className="scroll-x">
                            {loadingSuggestUsers ? <Loading/> : <>
                              {suggestUsers.length > 0 && suggestUsers.map((user: any) => (
                                <CardUser user={user}/>
                              ))}
                            </>}
                            </div>
                            {/* end Perfil recomendado */}
                            <div className="feed">
                                <div className="post_">
                                  <div className="text_area">
                                    <img className="avatar" src={`${user?.avatar ? user?.avatar : defaultAvatar}`}/>
                                    <textarea placeholder="Create a post"></textarea>
                                  </div>
                                </div>
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
