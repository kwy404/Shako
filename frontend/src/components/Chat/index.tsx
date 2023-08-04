import { useState } from 'react';
import closeIcon from '../../resources/images/close.png';
import dropeDown from "../../resources/images/dropdown.svg";
import './index.css';
import { Tooltip } from '@mui/material';
import adminBadge from "../../resources/images/admin.png";
import nitroBadge from "../../resources/images/nitro_badge.webp";
import defaultAvatar from "../../resources/images/default_avatar.webp";


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

interface Props {
    socket: Socket<DefaultEventsMap, DefaultEventsMap> | null,
    user: User,
    emited: (data: any, type: string, socket: Socket<DefaultEventsMap, DefaultEventsMap>) => void,
    setUser: (data: any) => void
}

function ChatComponent({ user, emited, socket, setUser }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [searchFound, setSearchFound] = useState<{ users: User[] }>({ users: [] });
  const [selectUser, setSelectUser] = useState({
    id: '',
    username: '',
    token: '',
    email: '',
    discrimination: '',
    avatar: '',
    admin: '',
    is_activated: '1',
    spotify_object: {name: "", artist: "", album: ""}
  })

  const handleConfirm = async () => {
    setIsLoading(true);
  };

  socket?.on('search', (found: any) => {
    if(found.type == 'searchChat'){
      setSearchFound(found);
    }
  })

  return (
    <div className={`chat--component--container ${isOpen ? 'chat--component--max' : 'chat--component--min'}`}>
      <div 
      onClick={() => setIsOpen(!isOpen)}
      className="header--component-chat">
        <p className="chat--logo">chat {selectUser?.id ? `${selectUser?.username}` : ''}</p>
        <div className="icons--">
          <div 
          onClick={() => setIsOpen(!isOpen)}
          className="button button--close">
            <img className={`close ${!isOpen ? 'invertIcon' : ''}`} src={isOpen ? dropeDown : dropeDown} alt="" />
          </div>
        </div>
      </div>
      <div className="left">
          <input 
          onKeyUp={(e) => {
            if (!socket) {
            // Handle the case when socket is null
            return;
            }
            emited(
            {
                username: (e.target as any).value,
                type: 'chat',
                typeSearch: 'searchChat',
                token: window.localStorage.getItem('token') ? window.localStorage.getItem('token') : ''
            },
            'searchUsers',
            socket
            );
          }}
          type="text" placeholder='Search Users to chat' className="search" />
          { searchFound.users.length > 0 && <div>
            { searchFound?.users.length > 0 && searchFound?.users.map((user => (
              <li
                className={`${selectUser.id === user.id ? 'activeChat': ''}`}
                onClick={() => setSelectUser(user)}
                key={user.id}>
                <div className="flex--contaienr">
                  <img className="avatar" src={`${user?.avatar ? user?.avatar : defaultAvatar}`}/>
                  <span>{user?.username} <span className="discrimination">#{user?.discrimination}</span></span>
                </div>
            </li>
          ))) }
          </div> }
      </div>
      <div className="right chat--mensanger">

      </div>
    </div>
  );
};

export default ChatComponent;
