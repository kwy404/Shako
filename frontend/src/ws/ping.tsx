import { useState, useEffect } from 'react'

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

function Ping(props:Props) {
  const [user_atual] = useState<User>(props.user);
  const [users, setUsers] = useState<User[]>([])

  useEffect(() => {
    setInterval(() => {
      props.emited({}, 'ping', props.socket)
    }, 10000)
  }, [])

  return (
    <div className="Ping">
      
    </div>
  )
}

export default Ping
