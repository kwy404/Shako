import { useState, useEffect } from "react";
import './index.css';
import { Link, useLocation, useHistory } from "react-router-dom";
import CryptoJS from "crypto-js";
import {Helmet} from "react-helmet";
import adminBadge from "../../resources/images/admin.png";
import banHammer from "../../resources/images/ban-hammer.png";
import spotify from "../../resources/images/spotify.png";
import nitroBadge from "../../resources/images/nitro_badge.webp";
import { Tooltip } from '@mui/material';
import axios from 'axios';
import SpotifyPlayerProfile from './SpotifyPlayerProfile';
import Loading from "../loading";
import defaultAvatar from "../../resources/images/default_avatar.webp";
import defaultBanner from "../../resources/images/default_banner.jpg";
import { FaSpinner } from 'react-icons/fa';

const typePage = "profile";

declare global {
  interface Window {
    MyNamespace: any;
  }
}

import { Socket } from "socket.io-client";
import { DefaultEventsMap } from 'socket.io/dist/typed-events';

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
  spotify: string;
}

interface Props {
  socket: Socket<DefaultEventsMap, DefaultEventsMap> | null,
  user: User,
  emited: (data: any, type: string, socket: Socket<DefaultEventsMap, DefaultEventsMap>) => void,
  setUser: (data: any) => void,
  params: any,
  notBack: any
}

interface CachedUser {
  id: string;
  profile: User;
  timestamp: number;
}

function convertDate(dateString: string) {
  const parts = dateString.split('/');
  const month = parseInt(parts[1], 10);
  const year = parseInt(parts[2], 10);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const monthString = months[month - 1];

  return `${monthString} ${year}`;
}

function Profile({ user, emited, params, socket, setUser, notBack }: Props) {
  const history = useHistory();
  const location = useLocation();
  const [messageError, setMessageError] = useState("");
  const [profile, setProfile] = useState<User>({
    id: params.user_id,
    username: params.username,
    token: '',
    email: '',
    discrimination: params.discrimination,
    avatar: '',
    banner: '',
    admin: '',
    is_activated: '1',
    created_at: '01/01/1999',
    verificado: '0',
    banned: '0',
    epic: '0',
    followingCount: '0',
    followersCount: '0',
    isFollow: '0',
    followBack: {},
    spotify_object: {isPlaying: false},
    spotify: ''
  });
  const [found, setFound] = useState(true);
  const [cachedUsers, setCachedUsers] = useState<{ [key: string]: CachedUser }>({});
  const [url, setUrl] = useState(window.location.pathname);
  const [loaded, setLoaded] = useState(false);
  const [loadingButtonFollow, setLoadingButtonFollow] = useState(false);
  const [connectionTime, setConnectionTime] = useState<number | null>(null);

  const loadingNewProfile = () => {
    setLoaded(false)
    setProfile({
      id: user?.id,
      username: params.username,
      token: '',
      email: '',
      discrimination: params.discrimination,
      avatar: '',
      banner: '',
      admin: '',
      is_activated: '1',
      created_at: '23/06/1999',
      verificado: '0',
      banned: '0',
      epic: '0',
      followingCount: '0',
      followersCount: '0',
      isFollow: '0',
      followBack: {},
      spotify_object: { isPlaying: false },
      spotify: ''
    });
  }

  useEffect(() => {
    if (socket) {
      if (!socket) {
        // Handle the case when socket is null
        return;
      }
      setTimeout(() => {
        emited({ username: params.username, discrimination: params.discrimination, user_id: params.user_id, token: window.localStorage.getItem('token') ? window.localStorage.getItem('token') : ''}, 'getProfile', socket);
      }, 500)
    }
  }, [ params ]);
  

  useEffect(() => {
    const encryptedCache = localStorage.getItem("cachedUsers");
    if (encryptedCache) {
      try {
        const decryptedCache = CryptoJS.AES.decrypt(encryptedCache, "kaway404_secret_admin").toString(CryptoJS.enc.Utf8);
        if (decryptedCache) {
          const parsedCache = JSON.parse(decryptedCache);
          setCachedUsers(parsedCache);
        }
      } catch (error) {
        // Se houver um erro ao descriptografar o cache, limpe o cache
        localStorage.removeItem("cachedUsers");
      }
    }
  }, []);

  useEffect(() => {
    const startTime = Date.now();
    const handleProfileEvent = (receive: any) => {
      try {
        if (receive.user.username === params.username && params.discrimination === receive.user.discrimination) {
          setLoadingButtonFollow(false);
          setProfile(receive.user);
          setLoaded(true);
          setFound(receive.success);
          setMessageError(receive.message);
          const endTime = Date.now();
          setConnectionTime(endTime - startTime);
          //Time
          console.log(`%c[FAST CONNECT] loaded profile ${params.username}#${params.discrimination} in ${endTime - startTime}ms`, 'color: purple;');
        } else {
          setFound(receive.success);
          setMessageError(receive.message);
        }
      } catch (error) {
        setProfile({
          id: user?.id,
          username: params.username,
          token: '',
          email: '',
          discrimination: params.discrimination,
          avatar: '',
          banner: '',
          admin: '',
          is_activated: '1',
          created_at: '23/06/1999',
          verificado: '0',
          banned: '0',
          epic: '0',
          followingCount: '0',
          followersCount: '0',
          isFollow: '0',
          followBack: {},
          spotify_object: { isPlaying: false },
          spotify: ''
        });
        setFound(false);
        setMessageError(receive.message);
      }
      if (receive.type === 'profileBanned') {
        if (profile.id && receive.user === profile.id) {
          profile.banned = receive.banned;
          if(!socket){
            return;
          }
          emited({ username: params.username, discrimination: params.discrimination, user_id: params.user_id, token: window.localStorage.getItem('token') ? window.localStorage.getItem('token') : '' }, 'getProfile', socket);
        }
      } else if (receive.type === 'follower') {
        if (profile.id) {
          if(!socket){
            return;
          }
          emited({ username: params.username, discrimination: params.discrimination, user_id: params.user_id, token: window.localStorage.getItem('token') ? window.localStorage.getItem('token') : '' }, 'getProfile', socket);
        }
      }
    };

    socket?.on('profile', handleProfileEvent);

    return () => {
      socket?.off('profile', handleProfileEvent);
    };
  }, [params]);

  
  const handleFileChangeAvatar = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      changeAvatar(event.target.files[0]);
    }
  };

  const handleFileChangeCover = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      changeBanner(event.target.files[0]);
    }
  };

  const changeAvatar = async (selectedFile: File | null) => {
    const token = window.localStorage.getItem('token') ? window.localStorage.getItem('token') : '';
    if (!selectedFile || !token) {
      return;
    }

    const formData = new FormData();
    formData.append('photo', selectedFile);
    formData.append('token', token);
    try {
      const response = await axios.post('https://shakophoto.onrender.com/uploadAvatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      if(response.data.avatar){
        const oldProfile = {...profile};
        oldProfile.avatar = response.data.avatar;
        setProfile(oldProfile);
        const oldUser = {...user};
        oldUser.avatar = response.data.avatar;
        setUser(oldUser);
        if(!socket){
          return;
        }
        emited({}, "connected", socket!);
      }
    } catch (error) {
      // console.error(error);
    }
  };

  const changeBanner = async (selectedFile: File | null) => {
    const token = window.localStorage.getItem('token') ? window.localStorage.getItem('token') : '';
    if (!selectedFile || !token) {
      return;
    }

    const formData = new FormData();
    formData.append('photo', selectedFile);
    formData.append('token', token);
    try {
      const response = await axios.post('https://shakophoto.onrender.com/uploadCover', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      if(response.data.banner){
        const oldProfile = {...profile};
        oldProfile.banner = response.data.banner;
        setProfile(oldProfile);
        const oldUser = {...user};
        oldUser.banner = response.data.banner;
        setUser(oldUser);
        if(!socket){
          return;
        }
        emited({}, "connected", socket!);
      }
    } catch (error) {
      // console.error(error);
    }
  };
  return (
    <>
      <Helmet>
        <meta charSet="utf-8" />
        <title>{`${params?.username} (u/${params?.username}/${params?.discrimination}/${params?.user_id}) - Shako`}</title>
        <meta property="og:title" content={`${params?.username}#${params?.discrimination}/${params?.user_id}) - Shako`} />
      </Helmet>
      {loaded}
        <div className="Profile">
        { !loaded && <Loading /> }
        { loaded && <>
          <div className="Header-Profile blur"/>
        <div className="Header-Profile">
          { !notBack && <Link to="/dashboard">
            <button className="back-icon">
              <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="r-4qtqp9 r-yyyyoo r-z80fyv r-dnmrzs r-bnwqim r-1plcrui r-lrvibr r-19wmn03"
              style={{ color: "rgb(239, 243, 244)" }}
              >
                <g>
                  <path d="M7.414 13l5.043 5.04-1.414 1.42L3.586 12l7.457-7.46 1.414 1.42L7.414 11H21v2H7.414z" />
                </g>
              </svg>
            </button>
          </Link>}
          
        </div>
        <div className="background">
          <div className="transparent"></div>
          <img className="cover" 
          src={`${profile?.banner ? profile?.banner : defaultBanner}`} alt="Cover" />
          { profile.spotify_object.isPlaying ? <SpotifyPlayerProfile
          user={profile}
          /> :  <img className="avatar" src={`${profile?.avatar ? profile?.avatar : defaultAvatar}`} alt="Avatar" />}
          { profile.id == user.id && <form>
            <div className={`changeAvatar-photo ${profile.spotify_object.isPlaying ? 'photoSpotify' : 'photoSpotifyNot'}`}>
              <label className="mudar_foto" htmlFor="file">Change photo</label>
              <input style={{display: 'none'}} type="file" id="file" accept="image/*" onChange={handleFileChangeAvatar} />
            </div>
            <div className={`changeAvatar-photo coverPhoto`}>
              <label className="mudar_foto cover-photo" htmlFor="fileCover">Change BANNER</label>
              <input style={{display: 'none'}} type="file" id="fileCover" accept="image/*" onChange={handleFileChangeCover} />
            </div>
          </form> }
        </div>
        <div className="info">
          <h3>
            {profile.username ? (
              <>
                {profile.username}
              </>
            ) : (
              params.username
            )}
            {profile.discrimination ? (
              <>
                <span className="discrimination">#{profile.discrimination}</span> 
                {profile?.verificado === '1' && (
                  <>
                  <Tooltip title="Verified profile.">
                    <svg viewBox="0 0 22 22" aria-label="Verified account" role="img" className="badge verified-icon r-1cvl2hr r-4qtqp9 r-yyyyoo r-1xvli5t r-f9ja8p r-og9te1 r-bnwqim r-1plcrui r-lrvibr" data-testid="icon-verified">
                      <g>
                        <path d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681s.075-1.299-.165-1.903c.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z"></path>
                      </g>
                    </svg>
                  </Tooltip>
                  </>
                )}
                {profile?.admin === '1' && (
                  <>
                    <Tooltip title="Admin user, just admin have this badge.">
                      <div className="badge--profile">
                        <img src={adminBadge}/>
                      </div>
                    </Tooltip>
                  </>
                )}
                {profile?.epic == '1' && (
                  <>
                    <Tooltip title="Epic User.">
                      <div className="badge--profile">
                        <img src={nitroBadge}/>
                      </div>
                    </Tooltip>
                  </>
                )}
              </>
            ) : (
              <>
                <span className="discrimination">#{params.discrimination}</span>
              </>
            )}
          </h3>
          {profile.username && (
            <h3 className="gray date-info">
              <svg viewBox="0 0 24 24" aria-hidden="true" className="date gray">
                <g>
                  <path d="M7 4V3h2v1h6V3h2v1h1.5C19.89 4 21 5.12 21 6.5v12c0 1.38-1.11 2.5-2.5 2.5h-13C4.12 21 3 19.88 3 18.5v-12C3 5.12 4.12 4 5.5 4H7zm0 2H5.5c-.27 0-.5.22-.5.5v12c0 .28.23.5.5.5h13c.28 0 .5-.22.5-.5v-12c0-.28-.22-.5-.5-.5H17v1h-2V6H9v1H7V6zm0 6h2v-2H7v2zm0 4h2v-2H7v2zm4-4h2v-2h-2v2zm0 4h2v-2h-2v2zm4-4h2v-2h-2v2z"></path>
                </g>
              </svg>
              Joined {convertDate(profile.created_at)}
              <br></br>
              <p className="followers"><span className="count">{profile?.followingCount ? profile?.followingCount : '0'}</span> <span>Following</span></p>
              <p className="followers"><span className="count">{profile?.followersCount ? profile?.followersCount : '0'}</span> <span>Followers</span></p>
            </h3>
          )}
          {!found && (
          <>
              <h1 className="notfoundprofile">
                  {messageError}
                  <br/><br/>
                  <span>Try searching for another user.</span>
              </h1>
          </>
          )}
           { found && user.id == profile.id && <>
            {user?.spotify && user?.spotify.trim().length > 0 ?
              <button 
              className="banned_button spotify_button">
                <img src={spotify}/>
                {user?.spotify && user?.spotify.trim().length > 0 ? `Connected` : `Connect`}</button>
             : <a href="https://accounts.spotify.com/authorize?response_type=code&client_id=dcbdff61d5a443afaba5b0b242893915&scope=user-read-currently-playing%20user-read-playback-state&redirect_uri=http://localhost:5173/spotify">
              <button 
              className="banned_button spotify_button">
                <img src={spotify}/>
                {user?.spotify && user?.spotify.trim().length > 0 ? `Connected` : `Connect`}</button>
            </a>}
          </> }
          { found && user.admin == '1' && user.id != profile.id && <>
            <button 
            className="banned_button"
            onClick={() => {
              if (!socket) {
                // Handle the case when socket is null
                return;
              }
              emited({ id: profile.id, token: window.localStorage.getItem('token') ? window.localStorage.getItem('token') : ''}, 'banUser', socket);
            }}>
              <img src={banHammer}/>
              {profile.banned == '1' ? `DESBAN ${profile.username}` : `BAN ${profile.username}`}</button>
          </> }
          { found && user.id != profile.id && <>
            <button 
            className={`banned_button follow_button ${loadingButtonFollow ? 'disabled-btn' : ''}`}
            onClick={() => {
              if (!socket) {
                // Handle the case when socket is null
                return;
              }
              setLoadingButtonFollow(true);
              if(!loadingButtonFollow){
                emited({ id: profile.id, token: window.localStorage.getItem('token') ? window.localStorage.getItem('token') : ''}, 'follow', socket);
              }
            }}>
              {loadingButtonFollow ? <><FaSpinner className="spin animation--spine" /></> : profile.followBack && profile.followBack.sender_id == profile.id 
                  ? (profile.isFollow && profile.isFollow.sender_id == user.id ? 'Stop to follow' : 'Follow back')
                  : (profile.isFollow && profile.isFollow.sender_id == user.id ? 'Unfollow' : 'Follow')}
              </button>
          </> }
        </div>
        </>}
      </div>
    </>
  );
}

export default Profile;
