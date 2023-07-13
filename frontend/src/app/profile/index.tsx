import { useState, useEffect } from "react";
import './index.css';
import { Link, useLocation  } from "react-router-dom";
import CryptoJS from "crypto-js";
import {Helmet} from "react-helmet";
import adminBadge from "../../resources/images/admin.png";
import { Tooltip } from '@mui/material';

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
  bg: string;
  admin: string;
  is_activated: string;
  created_at: string;
  verificado: string;
}

interface Props {
  socket: Socket<DefaultEventsMap, DefaultEventsMap> | null,
  user: User,
  emited: (data: any, type: string, socket: Socket<DefaultEventsMap, DefaultEventsMap>) => void,
  params: any
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

function Profile({ user, emited, params, socket }: Props) {
  const location = useLocation();
  const [messageError, setMessageError] = useState("");
  const [profile, setProfile] = useState<User>({
    id: '',
    username: '',
    token: '',
    email: '',
    discrimination: '',
    avatar: '',
    bg: '',
    admin: '',
    is_activated: '1',
    created_at: '01/01/1999',
    verificado: '0'
  });
  const [found, setFound] = useState(true);
  const [cachedUsers, setCachedUsers] = useState<{ [key: string]: CachedUser }>({});
  
  useEffect(() => {
    if (socket) {
      if (!socket) {
        // Handle the case when socket is null
        return;
      }
      emited({ username: params.username, discrimination: params.discrimination }, 'getProfile', socket);
    }
  }, [user, location.pathname, params, socket, emited]);
  

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

  socket?.on('profile', (receive: any) => {
    try {
      if(receive.user.username == params.username && params.discrimination == receive.user.discrimination){
        setProfile(receive.user);
        // setCachedUsers(prevState => ({ ...prevState, [cachedUser.id]: cachedUser }));
        setFound(receive.success);
        setMessageError(receive.message)
      } else{
        setFound(receive.success);
        setMessageError(receive.message)
      }
    } catch (error) {
      setProfile({
        id: '',
        username: params.username,
        token: '',
        email: '',
        discrimination: params.discrimination,
        avatar: '',
        bg: '',
        admin: '',
        is_activated: '1',
        created_at: '23/06/1999',
        verificado: '0'
      });
      setFound(false);
      setMessageError(receive.message)
    }
  });

  const getCachedProfile = (username: string, discrimination: string) => {
    const cachedUser = Object.values(cachedUsers).find(user => user.profile.username === username && user.profile.discrimination === discrimination);
    if (cachedUser && Date.now() - cachedUser.timestamp <= 2 * 60 * 60 * 1000) {
      return cachedUser.profile;
    }
    return null;
  };

  return (
    <>
      <Helmet>
        <meta charSet="utf-8" />
        <title>{`${params?.username} (u/${params?.username}/${params?.discrimination} - Shako)`}</title>
        <meta property="og:title" content={`${params?.username}#${params?.discrimination} - Shako`} />
      </Helmet>
      <div className="Profile">
        <div className="Header-Profile blur"/>
        <div className="Header-Profile">
          <Link to="/">
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
          </Link>
        </div>
        <div className="background">
          <div className="transparent"></div>
          <img className="cover" src="https://images.hdqwalls.com/wallpapers/reddit-cartoon-4k-io.jpg" alt="Cover" />
          <img className="avatar" src="https://www.redditstatic.com/avatars/avatar_default_12_545452.png" alt="Avatar" />
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
            #{profile.discrimination ? (
              <>
                {profile.discrimination}
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
              </>
            ) : (
              params.discrimination
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
        </div>
      </div>
    </>
  );
}

export default Profile;
