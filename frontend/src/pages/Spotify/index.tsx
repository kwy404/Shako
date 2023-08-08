import "./index.css";
import { io, Socket } from "socket.io-client";
import spotify_connect from "../../resources/images/spotify_connect.svg";
import divisor from "../../resources/images/plus.svg";
import { Buffer } from 'buffer';
import axios from 'axios';
import { useEffect } from "react";
import { useHistory } from 'react-router-dom';
  
declare global {
    interface Window {
        MyNamespace: any;
    }
}

let socket: Socket | null = null;

function Spotify() {
    const history = useHistory();
    useEffect(() => {
        if (!socket) {
            socket = io("localhost:9091");
        }
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
                                receive: {
                                    'access_token': access_token,
                                    'spotify_refresh_token': refresh_token,
                                    'code': code,
                                    token: window.localStorage.getItem("token")
                                }
                            },
                        });
                    }
                } catch (error: any) {
                    //
                }
            } catch (error) {
                console.log(error)
            }
        };
    
        if (window.location.search.split("code=")[1]) {
            spotifyCall(window.location.search.split("code=")[1]);
        }
        setTimeout(() => {
            history.push('/dashboard');
        }, 5000)
    }, [])
    return (
    <>
        <div className="app-3xd6d0">
        <div className="verifyConnectedAccount-3EQU9K">
            <div>
            <div className="logos-2S_BUa">
                <div className="logo-NKOv2w logoDiscord-3wgL1U"><h1 className="shako-logo">Shako</h1></div>
                <div className="logosDivider-2Dw-LR" style={{
                backgroundImage:
                    `url("${divisor}")`
                }} />
                <div
                className="logo-NKOv2w"
                style={{
                    backgroundImage:
                    `url("${spotify_connect}")`
                }}
                />
                </div>
                <div className="message-1eGzHc">
                    Logged in to your <strong>Spotify</strong> account at{" "}
                <strong>Shako</strong>. You can close this page. Automatic redirection in 5 seconds.
            </div>
            </div>
        </div>
        </div>
    </>
    )
  }
  
  export default Spotify;