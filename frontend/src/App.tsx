import { useState, useEffect } from 'react';
import './App.css';
import {
  BrowserRouter,
  Route,
  Switch,
  Redirect,
} from 'react-router-dom';

import Login from './pages/auth/login';
import Register from './pages/auth/register';
import Dashboard from './app/dashboard';
import Ativar from './pages/auth/ativar';

const ws = new WebSocket('ws://localhost:9000/ws/login')

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
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User>({
    id: '',
    username: '',
    token: '',
    email: '',
    discrimination: '',
    avatar: '',
    bg: '',
    admin: '',
    is_activated: '1',
  });

  useEffect(() => {
    ws.onmessage = (evt: any) => {
        // listen to data sent from the websocket server
        const message = JSON.parse(evt.data)
        if(message.user?.id){
          window.localStorage.setItem('token', message.user.token)
          setLogged(message.user)
        } 
        else if(message.type == 'validateToken'){
        //Validate token and logged if sucess
        const data = {type: 'validationToken', data: {token: window.localStorage.getItem('token')?window.localStorage.getItem('token'): 'undefined'}};
        ws.send(stringy(data))
      }
    }
}, []);

const stringy = (json: object) => {
  return JSON.stringify(json)
}

  const setLogged = (user: User) => {
    setUser(user);
    setLoading(true);
  };

  return (
    <div className="App dark-mode theme-default no-reduce-motion">
      { loading && <BrowserRouter>
        <Switch>
          <Route path="/login" exact>
            {user.id ? (
              <Redirect to="/" />
            ) : (
              <Login registerSucess={false} setLogged={setLogged} />
            )}
          </Route>
          <Route path="/register" exact>
            {user.id ? (
              <Redirect to="/" />
            ) : (
              <Register registerSucess={false} setLogged={setLogged} />
            )}
          </Route>
          <Route path="/registerSuccessfully" exact>
            {user.id ? (
              <Redirect to="/" />
            ) : (
              <Register registerSucess={true} setLogged={setLogged} />
            )}
          </Route>
          <Route path="/u/:username/:discrimination" exact>
            {user.id ? (
              user.is_activated == '1' ? (
                <Dashboard isProfile={true} user={user} />
              ) : (
                <Ativar user={user} setLogged={setLogged} />
              )
            ) : (
              <Redirect to="/login" />
            )}
          </Route>
          <Route path="/" exact>
            {user.id ? (
              user.is_activated === '1' ? (
                <Dashboard isProfile={false} user={user} />
              ) : (
                <Ativar user={user} setLogged={setLogged} />
              )
            ) : (
              <Login registerSucess={false} setLogged={setLogged} />
            )}
          </Route>
          <Route>
            <Redirect to="/" />
          </Route>
        </Switch>
      </BrowserRouter>}
    </div>
  );
}

export default App;