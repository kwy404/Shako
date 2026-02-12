import "./index.css";
import { io, Socket } from "socket.io-client";
import spotify_connect from "../../resources/images/spotify_connect.svg";
import divisor from "../../resources/images/plus.svg";
import axios from "axios";
import { useEffect } from "react";
import { useHistory } from "react-router-dom";

let socket: Socket | null = null;

function Spotify() {
    const history = useHistory();

    useEffect(() => {
        if (!socket) {
            socket = io("http://localhost:9091");
        }

        const spotifyCall = async (code: string) => {
            try {
                const clientId = "b350e4fa566b4aa1be5315e2bf0d80e9";
                const clientSecret = "2d3098e1b97945c4b0961fc05f2107b5";

                const redirectUri = "http://127.0.0.1:5173/spotify";

                const params = new URLSearchParams();
                params.append("grant_type", "authorization_code");
                params.append("code", code);
                params.append("redirect_uri", redirectUri);

                const response = await axios.post(
                    "https://accounts.spotify.com/api/token",
                    params,
                    {
                        headers: {
                            "Content-Type": "application/x-www-form-urlencoded",
                            Authorization:
                                "Basic " +
                                btoa(`${clientId}:${clientSecret}`),
                        },
                    }
                );

                const access_token = response.data.access_token;
                const refresh_token = response.data.refresh_token;

                if (access_token && socket) {
                    socket.emit("message", {
                        data: {
                            type: "spotify",
                            receive: {
                                access_token,
                                spotify_refresh_token: refresh_token,
                                code,
                                token: window.localStorage.getItem("token"),
                            },
                        },
                    });
                }

                setTimeout(() => {
                    history.push("/dashboard");
                }, 3000);
            } catch (error: any) {
                console.error("Spotify Error:", error.response?.data || error.message);
            }
        };

        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");

        if (code) {
            spotifyCall(code);
        }
    }, [history]);

    return (
        <div className="app-3xd6d0">
            <div className="verifyConnectedAccount-3EQU9K">
                <div>
                    <div className="logos-2S_BUa">
                        <div className="logo-NKOv2w logoDiscord-3wgL1U">
                            <h1 className="shako-logo">Shako</h1>
                        </div>

                        <div
                            className="logosDivider-2Dw-LR"
                            style={{ backgroundImage: `url("${divisor}")` }}
                        />

                        <div
                            className="logo-NKOv2w"
                            style={{ backgroundImage: `url("${spotify_connect}")` }}
                        />
                    </div>

                    <div className="message-1eGzHc">
                        Logged in to your <strong>Spotify</strong> account at{" "}
                        <strong>Shako</strong>. You can close this page.
                        Automatic redirection in 3 seconds.
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Spotify;
