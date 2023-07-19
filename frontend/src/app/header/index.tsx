import { useState, useEffect } from "react";
// Webpack CSS import
import 'onsenui/css/onsenui.css';
import 'onsenui/css/onsen-css-components.css';
import './index.css';
import expand_icon from "../../resources/images/expandgrey.png"
import bell_icon from "../../resources/images/bell.png"
import chat_icon from "../../resources/images/chat.png"
import search_icon from "../../resources/images/search.svg";
import { Tooltip } from '@mui/material';
import adminBadge from "../../resources/images/admin.png";
import nitroBadge from "../../resources/images/nitro_badge.webp";
import defaultAvatar from "../../resources/images/default_avatar.webp";

import { Link } from "react-router-dom";

import { Socket } from "socket.io-client";
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { FaSignOutAlt, FaUser  } from 'react-icons/fa'

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
    banned: string;
    epic: string;
    followingCount: string;
    followersCount: string;
    isFollow: any;
    followBack: any;
  }

const typePage = "header";

interface Props {
    socket: Socket<DefaultEventsMap, DefaultEventsMap> | null,
    user: User,
    emited: (data: any, type: string, socket: Socket<DefaultEventsMap, DefaultEventsMap>) => void,
    setUser: (data: any) => void,
  }

declare global {
    interface Window {
        MyNamespace: any;
    }
}

function Header({ user, emited, socket, setUser }: Props) {
    const [searchFound, setSearchFound] = useState<{ users: User[] }>({ users: [] });
    const [profileMenu, setProfileMenu] = useState(false);
    socket?.on('search', (found: any) => {
        setSearchFound(found);
    })
    return (
        <div className="Header">
            <div className="center">
                <div className="absolute left">
                    <Link to={"/dashboard"} onClick={() => setProfileMenu(false)}><h1>Shako</h1></Link>
                </div>
                <div className="absolute right">
                    <img className="icon search-input" src={search_icon}/>
                    <input
                    onBlur={(e) => {
                        (e.target as any).value = ""
                        setTimeout(() => {
                            setSearchFound({users: []})
                        }, 200)
                    }}
                    onClick={() => setProfileMenu(false)}
                    onKeyUp={(e) => {
                        if (!socket) {
                        // Handle the case when socket is null
                        return;
                        }
                        emited(
                        {
                            username: (e.target as any).value,
                            token: window.localStorage.getItem('token') ? window.localStorage.getItem('token') : ''
                        },
                        'searchUsers',
                        socket
                        );
                    }}
                    className="search-bar"
                    type="text"
                    placeholder="Search on Shako"
                    />
                    { searchFound.users.length > 0 && <div className="foundUsers">
                        { searchFound?.users.length > 0 && searchFound?.users.map((user => (
                            <Link to={`/u/${user.username}/${user.discrimination}/${user.id}`}>
                                <li key={user.id}>
                                    <img className="avatar" src={`${user?.avatar ? user?.avatar : 'https://www.redditstatic.com/avatars/avatar_default_12_545452.png'}`}/>
                                    <span className="username">{user?.username}</span>
                                    <span className="discrimination">#{user?.discrimination}</span>
                                    <>
                                        { user?.verificado == '1' && <Tooltip title="Verified profile.">
                                            <svg 
                                            width={'20px'}
                                            height={'20px'}
                                            viewBox="0 0 22 22" aria-label="Verified account" role="img" className="badge--profile verified-icon r-1cvl2hr r-4qtqp9 r-yyyyoo r-1xvli5t r-f9ja8p r-og9te1 r-bnwqim r-1plcrui r-lrvibr" data-testid="icon-verified">
                                            <g>
                                                <path d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681s.075-1.299-.165-1.903c.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z"></path>
                                            </g>
                                            </svg>
                                        </Tooltip> }
                                        { user?.admin == '1' && 
                                        <Tooltip title="Admin user, just admin have this badge.">
                                            <div className="badge--profile">
                                                <img src={adminBadge}/>
                                            </div>
                                        </Tooltip> }
                                        { user?.epic == '1' && 
                                        <Tooltip title="Epic User.">
                                            <div className="badge--profile">
                                                <img src={nitroBadge}/>
                                            </div>
                                        </Tooltip> }
                                    </>
                                </li>
                            </Link>
                        ))) }
                    </div> }
                    <img className="icon bell-icon" src={bell_icon}/>
                    <img className="icon chat-icon" src={chat_icon}/>
                    <div 
                    tabIndex={1} // Torna a div focável
                    onClick={() => setProfileMenu(!profileMenu)}
                    onBlur={() => setProfileMenu(false)}
                    className={`profile ${profileMenu ? 'profileAtivo' : ''}`}>
                        <img className="icon expand" src={expand_icon}/>
                        <img className="avatar" src={`${user?.avatar ? user?.avatar : defaultAvatar}`}/>
                        <span className="username">{user.username}
                        <span className="discrimination">#{user.discrimination}</span>
                        </span>
                    </div>
                    <div 
                    className={`${profileMenu ? 'list-menu list-menu-open' : 'list-menu list-menu-closed'}`}>
                        <Link 
                            onClick={() => setProfileMenu(false)}
                            to={`/u/${user.username}/${user.discrimination}/${user.id}`}>
                            <li>
                                <span>
                                    <FaUser />  Profile
                                </span>
                            </li>
                        </Link>
                        <Link
                        onClick={() => {
                            window.localStorage.setItem("token", "")
                            location.reload()
                        }}
                        to={'/login'}>
                        <li>
                            <span>
                                <FaSignOutAlt /> Logout
                            </span>
                        </li>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Header;
