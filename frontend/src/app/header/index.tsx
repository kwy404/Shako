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

const typePage = "header";

declare global {
    interface Window {
        MyNamespace: any;
    }
}

import { io, Socket } from "socket.io-client";
var socket: Socket;

function Header({ user }: any) {
    return (
        <div className="Header">
            <div className="absolute left">
                <h1>Shako</h1>
            </div>
            <div className="absolute right">
                <img className="icon search-input" src={search_icon}/>
                <input className="search-bar" type="text" placeholder="Search on Shako"/>
                <img className="icon bell-icon" src={bell_icon}/>
                <img className="icon chat-icon" src={chat_icon}/>
                <div className="profile">
                    <img className="icon expand" src={expand_icon}/>
                    <img className="avatar" src="https://www.redditstatic.com/avatars/avatar_default_12_545452.png"/>
                    <span className="username">{user.username}#{user.discrimination}</span>
                </div>
            </div>
        </div>
    );
}

export default Header;
