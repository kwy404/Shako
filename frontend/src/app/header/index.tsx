import { useState, useEffect } from "react";
// Webpack CSS import
import 'onsenui/css/onsenui.css';
import 'onsenui/css/onsen-css-components.css';
import './index.css';
import expand_icon from "../../resources/images/expandgrey.png"
import bell_icon from "../../resources/images/bell.png"
import chat_icon from "../../resources/images/chat.png"
import search_icon from "../../resources/images/search.svg";

import { Link } from "react-router-dom";

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
  }

declare global {
    interface Window {
        MyNamespace: any;
    }
}

function Header({ user, emited, socket }: Props) {
    return (
        <div className="Header">
            <div className="center">
                <div className="absolute left">
                    <Link to={"/"}><h1>Shako</h1></Link>
                </div>
                <div className="absolute right">
                    <img className="icon search-input" src={search_icon}/>
                    <input
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
                    <img className="icon bell-icon" src={bell_icon}/>
                    <img className="icon chat-icon" src={chat_icon}/>
                    <Link to={`/u/${user.username}/${user.discrimination}`}>
                        <div className="profile">
                            <img className="icon expand" src={expand_icon}/>
                            <img className="avatar" src="https://www.redditstatic.com/avatars/avatar_default_12_545452.png"/>
                            <span className="username">{user.username}
                            <span className="discrimination">#{user.discrimination}</span>
                            </span>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default Header;
