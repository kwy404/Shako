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

declare global {
    interface Window {
        MyNamespace: any;
    }
}

let socket: Socket | null = null;
let socketSpotfiy: Socket | null = null;

function Dashboard({ user, isProfile, setUser }: any) {
    const params = useParams<{ username?: string; discrimination?: string }>();
    const [loading, setLoading] = useState(false);
    const initialMount = useRef(true);
    const [refresh_token_, setRefreshToken] = useState("");
 
    useEffect(() => {
        if (!socket) {
            socket = io("localhost:9091");
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
              const clientSecret = 'bc31a0ced0134e95a4e2263e2ab83ba6';
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
                console.log('Response:', response.data);
                const access_token = response.data.access_token
                const refresh_token = response.data.refresh_token // Obtenha o token de atualização do response
                setRefreshToken(refresh_token)
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
                    // Lide com o erro ao atualizar o token de acesso
                    window.location.search = "error=1";
                    setTimeout(() => {
                      window.location.pathname = "/dashboard";
                    }, 200);
                  }
                } else {
                  // Lide com outros erros
                  window.location.search = "error=1";
                  setTimeout(() => {
                    window.location.pathname = "/dashboard";
                  }, 200);
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

    return (
        <div className="dashboard">
            {loading ? (
                <>
                    <Header user={user} emited={emited} setUser={() => {}} socket={socket}/>
                    {/* <Online user={user} socket={socket!} emited={emited} /> */}
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
