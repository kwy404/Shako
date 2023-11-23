import { useState, useRef, useEffect } from 'react';
import dropeDown from "../../resources/images/dropdown.svg";
import './index.css';
import defaultAvatar from "../../resources/images/default_avatar.webp";
import badgeBot from "../../resources/images/bot.png";
import Loading from '../../app/loading';
import { Link } from "react-router-dom";
import MessageRenderer from "./renderMessage";
import GifSelector from './giphy';
import Dashboard from '../../app/dashboard';

declare global {
    interface Window {
      MyNamespace: any;
    }
}
  
import { Socket } from "socket.io-client";
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { Tooltip } from '@mui/material';
  
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
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingChat, setIsLoadingChat] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [searchFound, setSearchFound] = useState<{ users: User[] }>({ users: [] });
  const chatInput = useRef<HTMLInputElement>(null);
  const [messagens, setMensanges] = useState<any[]>([]);
  const [myChatUsers, setMyChatUsers] = useState([])
  const [gifOpen, setGifOpen] = useState(false);
  const [youtubeHTML, setYoutubeHTML] = useState('');
  const [connectionTime, setConnectionTime] = useState<number | null>(null);
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

  const generateToken = (length : any) => {
    const characters =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
    let token = "";
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      token += characters[randomIndex];
    }
    return token;
  }

  socket?.on('search', (found: any) => {
    if(found.type == 'searchChat'){
      setSearchFound(found);
    }
  })

  useEffect(() => {
    const socketListener = (data: any) => {
      // Check if the message with the same ID already exists in the state
      const messageExists = messagens.some((message) => message.id === data.message.id);
    
      // If the user ID matches the selected user's ID
      if (selectUser?.id === data.message.receiveId || selectUser?.id === data.message.senderId) {
        setMensanges((prevMessages) => {
          // If the message exists, replace it with the new message
          if (messageExists) {
            return prevMessages.map((message) =>
              message.id === data.message.id ? data.message : message
            );
          } else {
            // Otherwise, add the new message to the state
            return [...prevMessages, data.message];
          }
        });
        scrollToBottom();
      }
    };    
  
    socket?.on('messenger', socketListener);
  
    return () => {
      socket?.off('messenger', socketListener);
    };
  }, [selectUser, messagens, socket]);

  useEffect(() => {
    const loadMessenger = (data: any) => {
      setMensanges(data.message);
      scrollToBottom();
      setIsLoading(false);
    };

    const youtubeLoad = (data: any) => {
      setYoutubeHTML(data.data);
      console.log(data)
    }
    
    if (socket) {
      socket.on('mensagens', loadMessenger);
      socket.on('youtube', youtubeLoad)
      emited({ user_id: selectUser?.id, token: window.localStorage.getItem('token') ? window.localStorage.getItem('token') : '' }, 'getMensagens', socket);
    }
  
    return () => {
      if (socket) {
        socket.off('mensagens', loadMessenger);
        socket.off('youtube', youtubeLoad)
      }
    };
  }, [selectUser, socket]);  

  useEffect(() => {
    if (socket) {
      const startTime = Date.now();
      const getLastMensagens = (data: any) => {
        // data.messages.unshift({
        //   id: 'Yee',
        //   username: 'Yee.ia',
        //   token: '',
        //   email: '',
        //   discrimination: '0001',
        //   avatar: 'https://img.freepik.com/vetores-premium/chatbot-servico-de-ia-virtual-suporta-bot-de-chat-de-robo_8071-11023.jpg?w=2000',
        //   admin: '',
        //   is_activated: '1',
        //   spotify_object: { name: "", artist: "", album: "" }
        // })
        setMyChatUsers(data.messages);
        // Novo objeto a ser adicionado no início do array
        setIsLoadingChat(false);
        //Loading chat
        const endTime = Date.now();
        setConnectionTime(endTime - startTime);
        //Time
        console.log(`%c[FAST CONNECT] loaded lastMessages in ${endTime - startTime}ms`, 'color: purple;');
      };
  
      socket.on('getLastMensagens', getLastMensagens);
  
      // Emit the request to get the last messages when the component mounts
      emited({ user_id: selectUser?.id, token: window.localStorage.getItem('token') || '' }, 'getLastMensagens', socket);
      // Emit the request to get the last messages when the component mounts
      emited({ user_id: selectUser?.id, token: window.localStorage.getItem('token') || '' }, 'youtube', socket);
  
      // Clean up the event listeners when the component unmounts to avoid memory leaks
      return () => {
        socket.off('getLastMensagens', getLastMensagens);
      };
    }
  }, [socket, selectUser, true]);

  const handleInputChange = (inputElement: HTMLInputElement | null): void => {
    if (inputElement) {
      inputElement.value = "";
    }
  };

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      // Scroll the div to the bottom by setting scrollTop to the scrollHeight
      setTimeout(() => {
        if(messagesContainerRef.current){
          messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
      }, 500);
    }
  };

  return (
    <>
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
          onBlur={(e) => {
            setTimeout(() => {
              e.target.value = "";
              setSearchFound({ users: [] });
            }, 1000);
          }}
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
            <span className='span span-a'>Search Results</span>
            { searchFound?.users.length > 0 && searchFound?.users.map((user => (
              <li
                className={`${selectUser.id === user.id ? 'activeChat': ''}`}
                onClick={() => 
                  {
                    if(selectUser.id !== user.id){
                      setIsLoading(true);
                    }
                    setSelectUser(user)
                  }
                }
                key={user.id}>
                <div className="flex--contaienr">
                  <img className="avatar" src={`${user?.avatar ? user?.avatar : defaultAvatar}`}/>
                  <span className="span">{user?.username} <span className="span discrimination">#{user?.discrimination}</span></span>
                </div>
            </li>
          ))) }
          </div> }
          { isLoadingChat ? <Loading></Loading> : <>
          { myChatUsers.length > 0 && <div>
            <span className='span-a'>My chat</span>
            { myChatUsers?.length > 0 && myChatUsers.map((user:any) => (
              <li
              className={`chatFoundUserB ${selectUser.id === user.id ? 'activeChat': ''}`}
              onClick={() => 
                {
                  if(selectUser.id !== user.id){
                    setIsLoading(true);
                  }
                  setSelectUser(user)
                }
              }
              key={user.id}>
              <div className="flex--contaienr">
                <img className="avatar" src={`${user?.avatar ? user?.avatar : defaultAvatar}`}/>
                <span className="span">{user?.username} <span className="span discrimination">#{user?.discrimination}</span></span>
              </div>
              </li>
            )) }
          </div> }
          </>}
      </div>
      <div className="right chat--mensanger" ref={messagesContainerRef}>
          {selectUser?.id ? <>
          <div className="info--user info--user--blur"></div>
          <Link 
          onClick={() => setIsOpen(false)}
          to={`/u/${selectUser.username}/${selectUser.discrimination}/${selectUser.id}`}>
          <div className="info--user">
            <img className="avatar" src={`${selectUser?.avatar ? selectUser?.avatar : defaultAvatar}`}/>
            <h3>{ selectUser.username }#{ selectUser.discrimination } {selectUser?.id == 'Yee' && 
            <>
            <span style={{opacity: '0.4'}}>-</span> <Tooltip title="Bot IA."><img 
            className='badge--chat'
            src={badgeBot}/></Tooltip>
            </>
            }</h3>
          </div></Link>
          { isLoading ? <><Loading></Loading></> : <>
            { messagens.map((message: any) => (
            <li 
            className={`chatmessage ${message.sending ? 'msg--sending' : 'msg--receive'}`}
            key={message.id}>
              <div className="flex--container message-m">
                <img src={message.avatar ? message.avatar : defaultAvatar} alt="User Avatar" />
                <div className="username--p-message">
                  {`${message.senderId == user.id ? user.username+"#"+user.discrimination: selectUser.username+"#"+selectUser.discrimination}`}
                </div>
                <p className='mensagem--p'>
                  <MessageRenderer message={message.message} />
                </p>
              </div>
            </li>
            ))}
          </>  }
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
            const token = generateToken(20)
            emited(
            {
                usernameId: selectUser?.id,
                type: 'chatMessage',
                token: window.localStorage.getItem('token') ? window.localStorage.getItem('token') : '',
                message: chatInput.current?.value,
                id: token
            },
            'chatContainer',
            socket
            );
            const addFakeMessageLoading = () => {
              const novaMensagem = { 
                message: chatInput.current?.value,
                avatar: user.avatar ? user.avatar : defaultAvatar,
                id: token,
                userId: user?.id,
                senderId: user?.id,
                receiveId: selectUser?.id,
                sending: true
              }
              setMensanges([...messagens, novaMensagem]);
            }
            addFakeMessageLoading();
            handleInputChange(e.currentTarget.elements[0] as HTMLInputElement);
        }}>
        <input
        ref={chatInput}
        placeholder={`Send a message to ${selectUser?.username}#${selectUser?.discrimination}`}
        type="text" />
        <div className="icons">
          <div
            onClick={() => { 
              setGifOpen(!gifOpen)
              setTimeout(() => {
                const gifElement = window.document.querySelector('.gif input') as HTMLImageElement;
                if (gifElement) {
                  gifElement.focus();
                }
              }, 200);
            }}
            className="buttonWrapper"
          >
            <svg
              width={24}
              height={24}
              className="icon-1d5zch"
              aria-hidden="true"
              role="img"
              viewBox="0 0 24 24"
            >
              <path
                d="m2 2c-1.1046 0-2 0.89543-2 2v16c0 1.1046 0.89543 2 2 2h20c1.1046 0 2-0.8954 2-2v-16c0-1.1046-0.8954-2-2-2h-20zm2.4846 13.931c0.55833 0.375 1.2 0.5625 1.925 0.5625 0.96667 0 1.6958-0.3333 2.1875-1l0.2375 0.825h1.475v-4.9h-3.7625v1.625h1.9875v1.075c-0.15833 0.225-0.38333 0.4042-0.675 0.5375-0.28333 0.125-0.59583 0.1875-0.9375 0.1875-0.76667 0-1.3542-0.2458-1.7625-0.7375-0.40833-0.4916-0.6125-1.1916-0.6125-2.1 0-0.9 0.20417-1.5958 0.6125-2.0874 0.40833-0.5 0.99583-0.75 1.7625-0.75 0.84167 0 1.475 0.39166 1.9 1.175l1.4125-1.0124c-0.30003-0.575-0.74586-1.0208-1.3375-1.3375-0.58333-0.31667-1.2458-0.475-1.9875-0.475-0.875 0-1.6292 0.19166-2.2625 0.575-0.625 0.38333-1.1042 0.9125-1.4375 1.5875-0.325 0.67495-0.4875 1.45-0.4875 2.325 0 0.8834 0.15417 1.6667 0.4625 2.35 0.30833 0.675 0.74167 1.2 1.3 1.575zm7.4509 0.3875h1.825v-8.625h-1.825v8.625zm3.5767 0h1.825v-3.275h3.2v-1.65h-3.2v-2.05h3.9375v-1.65h-5.7625v8.625z"
                clipRule="evenodd"
                fillRule="evenodd"
                fill="currentColor"
              />
            </svg>
          </div>
        </div>
        { gifOpen && selectUser?.id && <div 
        tabIndex={100}
        className="gif">
          <GifSelector emited={emited} socket={socket} selectUserId={selectUser.id} setGifOpen={setGifOpen}/>
        </div>}
        <button style={{display: 'none'}}></button>
        </form>
      </div>}
      
    </div>
    <div className="right--profile--selected">
      { selectUser.id && isOpen && <Dashboard isProfile={true} setUser={setUser} user={user} chatProfile={{user_id: selectUser.id, username: selectUser.username, discrimination: selectUser.discrimination}}/> }
    </div>
  </>
  );
};

export default ChatComponent;