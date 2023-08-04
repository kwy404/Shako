import { useState, useRef } from 'react';
import dropeDown from "../../resources/images/dropdown.svg";
import './index.css';
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

// Future use the code to chat date
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
  const chatInput = useRef<HTMLInputElement>(null);
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

  const handleInputChange = (inputElement: HTMLInputElement | null): void => {
    if (inputElement) {
      inputElement.value = "";
    }
  };

  return (
    <div className={`chat--component--container ${isOpen ? 'chat--component--max' : 'chat--component--min'}`}>
      <div 
      onClick={() => setIsOpen(!isOpen)}
      className="header--component-chat">
        <p className="chat--logo">chat {selectUser?.id ? `- ${selectUser?.username}` : ''}</p>
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
          {selectUser?.id ? <>
          <div className="info--user info--user--blur"></div>
          <div className="info--user">
            <img className="avatar" src={`${selectUser?.avatar ? selectUser?.avatar : defaultAvatar}`}/>
            <h3>{ selectUser.username }#{ selectUser.discrimination }</h3>
          </div>
          <li>
            <div className="flex--container">
              <img src={defaultAvatar}/>
              <p className='mensagem--p'>
                A little message
              </p>
            </div>
          </li>
          </> : <>
          <div className="info--user info--user--blur"></div>
          <div className="info--user">
            <img className="avatar" src={defaultAvatar}/>
            <h3>Select Any User#0000</h3>
          </div>
          </>}
      </div>
      {/* Input chat */}
      {selectUser?.id && isOpen && <div className="input--chat">
        <form onSubmit={(e) => {
            e.preventDefault();
            if (!socket) {
              // Handle the case when socket is null
              return;
            }
            emited(
            {
                usernameId: selectUser?.id,
                type: 'chatMessage',
                token: window.localStorage.getItem('token') ? window.localStorage.getItem('token') : '',
                message: chatInput.current?.value
            },
            'chat--container',
            socket
            );
            handleInputChange(e.currentTarget.elements[0] as HTMLInputElement);
        }}>
        <input
        ref={chatInput}
        placeholder={`Send a message to ${selectUser?.username}#${selectUser?.discrimination}`}
        type="text" />
        <button style={{display: 'none'}}></button>
        </form>
        
      </div>}
    </div>
  );
};

export default ChatComponent;
