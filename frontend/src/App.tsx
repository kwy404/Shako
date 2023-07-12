import { useState } from 'react'
import './App.css'
import {
  BrowserRouter,
  Route
} from "react-router-dom"

import Login from './pages/auth/login'
import Register from './pages/auth/register'
import Dashboard from './app/dashboard';
import Ativar from './pages/auth/ativar'

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
}

function App() {
  const [user, setUser] = useState<User>({
    id: '',
    username: '',
    token: '',
    email: '',
    discrimination: '',
    avatar: '',
    bg: '',
    admin: '',
    is_activated: '0'
  });

  let intervalConnect = setInterval(function() {
    clearInterval(intervalConnect)
  }, 1000);

  const setLogged = (user: Object) => {
    setUser(user as any)
  }

  return (
    <div className="App lighter theme-default no-reduce-motion">
      <BrowserRouter>
        <Route path="/" exact render={(props) => <>
          { user?.id ? <>
            {user?.is_activated == '1' ? <Dashboard user={user}/> : <Ativar user={user} setLogged={setLogged}/>}
          </> : <Login registerSucess={false} setLogged={setLogged} /> }
        </>} />
        <Route path="/registerSucessfully" exact render={(props) => <>
          { user?.id ? <>
            {user?.is_activated == '1' ? <Dashboard user={user}/> : <Ativar user={user} setLogged={setLogged}/>}
          </> : <Login registerSucess={true} setLogged={setLogged} /> }
        </>} />
        <Route path="/login" exact render={(props) => <>
          { user?.id ? <>
            {user?.is_activated == '1' ? <Dashboard user={user}/> : <Ativar user={user} setLogged={setLogged}/>}
          </> : <Login registerSucess={false}  setLogged={setLogged} /> }
        </>} />
        <Route path="/app" exact render={(props) => <>
          { user?.id ? <>
            {user?.is_activated == '1' ? <Dashboard user={user}/> : <Ativar user={user} setLogged={setLogged}/>}
          </> : <Login registerSucess={false}  setLogged={setLogged} /> }
        </>} />
        <Route path="/register" exact render={(props) => <>
          { user?.id ? <>
            {user?.is_activated == '1' ? <Dashboard user={user}/> : <Ativar user={user} setLogged={setLogged}/>}
          </> : <Register registerSucess={false}  setLogged={setLogged}/> }
        </>} />
      </BrowserRouter>
    </div>
  )
}

export default App
