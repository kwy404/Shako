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

const ws = new WebSocket('ws://localhost:9100/ws/login')

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
  const [localStorageItem, setLocalStorageItem] = useState<string | null>(null);
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
      setLoading(true);
      ws.onmessage = (evt: any) => {
          // listen to data sent from the websocket server
          const message = JSON.parse(evt.data)
          if(message.user?.id){
            window.localStorage.setItem('token', message.user.token)
            setLogged(message.user)
          } else{
            setUser({
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
          } 
          if(message.type == 'validateToken'){
            //Validate token and logged if sucess
            const data = {type: 'validationToken', data: {token: window.localStorage.getItem('token')?window.localStorage.getItem('token'): 'undefined'}};
            ws.send(stringy(data))
          }
      }
      window.localStorage.getItem('token')?window.localStorage.getItem('token'): setLoading(true);
      setLoading(true);
  }, []);

  useEffect(() => {
    // Function to handle the storage event
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'token') {
        setLocalStorageItem(event.newValue);
        //Validate token and logged if sucess
        const data = {type: 'validationToken', data: {token: window.localStorage.getItem('token')?window.localStorage.getItem('token'): 'undefined'}};
        ws.send(stringy(data))
      }
    };

    // Add event listener for the storage event
    window.addEventListener('storage', handleStorageChange);

    // Cleanup function to remove the event listener
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []); // Empty dependency array to run the effect only once

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
              user.is_activated === '1' ? (
                <Dashboard isProfile={false} user={user} />
              ) : (
                <Ativar user={user} setLogged={setLogged} />
              )
            ) : (
              <Login registerSucess={false} setLogged={setLogged} />
            )}
          </Route>
          <Route path="/register" exact>
          {user.id ? (
              user.is_activated === '1' ? (
                <Dashboard isProfile={false} user={user} />
              ) : (
                <Ativar user={user} setLogged={setLogged} />
              )
            ) : (
              <Register registerSucess={false} setLogged={setLogged} />
            )}
          </Route>
          <Route path="/registerSucessfully" exact>
            {user.id ? (
              user.is_activated === '1' ? (
                <Dashboard isProfile={false} user={user} />
              ) : (
                <Ativar user={user} setLogged={setLogged} />
              )
            ) : (
              <Login registerSucess={true} setLogged={setLogged} />
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
              <Login registerSucess={false} setLogged={setLogged} />
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