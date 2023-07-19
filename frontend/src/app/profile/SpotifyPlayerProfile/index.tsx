import { useState, useEffect } from "react";
import './index.css';
import { Tooltip } from '@mui/material';
import defaultAvatar from "../../../resources/images/default_avatar.webp";

const typePage = "profile";

interface User {
    id: string;
    username: string;
    token: string;
    email: string;
    discrimination: string;
    avatar: string;
    banner: string;
    admin: string;
    is_activated: string;
    created_at: string;
    verificado: string;
    banned: string;
    epic: string;
    followingCount: string;
    followersCount: string;
    isFollow: any;
    followBack: any;
    spotify_object: any;
}
  
interface Props {
    user: User
}

function SpotifyPlayerProfile({ user }: Props) {
  return (
    <>
      <div>
        <div className="spotify_card">
            <img className="avatar" src={`${user?.avatar ? user?.avatar : defaultAvatar}`} alt="Avatar" />
            <h1></h1>
            <div className="subCard">
                <h1 className="listen">LISTENING TO SPOTIFY</h1>
                <div className="cover_t">
                    <img src={user.spotify_object.album.images[0].url}/>
                </div>
                <Tooltip title={user.spotify_object.name}><h1 className="music_name">{user.spotify_object.name}</h1></Tooltip>
                
                <Tooltip title={user.spotify_object.artists[0].name}><h1 className="album_name">by {user.spotify_object.artists[0].name}</h1></Tooltip>
            </div>
        </div>
      </div>
    </>
  );
}

export default SpotifyPlayerProfile;
