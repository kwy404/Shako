import { useState, useEffect } from 'react'

import {
  BrowserRouter,
  Route,
  Link
} from "react-router-dom"

interface User {
  id: string;
  username: string;
  token: string;
  email: string;
  discrimination: string;
  avatar: string;
  bg: string;
  admin: string;
}

import { Socket } from "socket.io-client";
import { DefaultEventsMap } from 'socket.io/dist/typed-events';

interface Props {
  socket: Socket<DefaultEventsMap, DefaultEventsMap>,
  user: User,
  emited: (data: any, type: string, socket: Socket<DefaultEventsMap, DefaultEventsMap>) => void
}

function ChatContainer(props:Props) {
  const [user_atual] = useState<User>(props.user);
  const [users, setUsers] = useState<User[]>([])

  useEffect(() => {
    props.emited({}, 'getFriends', props.socket)

    props.socket.on('getFriendsChat', (friends: User[]) => {
      setUsers(friends)
    })

    props.socket.on('pong', (message: any) => {
      console.log(message)
    })
  }, [])

  return (
    <div className="Chat_Container">
      <div className='left_chat'>
        <ul>
          { users?.map((user) => (
            <li key={user?.id}>
              { user?.username }<span style={{
                display: 'none'
              }}>#{user?.discrimination}</span>
            </li>
          )) }
        </ul>
      </div>
    </div>
  )
}

export default ChatContainer
