import React, { useState, useEffect } from 'react';
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom';
import Login from './pages/auth/login';
import Register from './pages/auth/register';
import Dashboard from './app/dashboard';
import Ativar from './pages/auth/ativar';
import Spotify from './pages/Spotify';

const ws = new WebSocket('wss://shakoapp.onrender.com/ws/login');

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
  spotify_object: any;
}

function App() {
  const [loading, setLoading] = useState(true);
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
    spotify_object: { name: '', artist: '', album: '' }
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        ws.onmessage = (evt: MessageEvent) => {
          const message = JSON.parse(evt.data);
          if (message.user?.id) {
            window.localStorage.setItem('token', message.user.token);
            setLogged(message.user);
          } else {
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
              spotify_object: { name: '', artist: '', album: '' }
            });
          }
          if (message.type === 'validateToken') {
            const data = {
              type: 'validationToken',
              data: { token: window.localStorage.getItem('token') || 'undefined' }
            };
            ws.send(stringify(data));
          }
        };

        const storedToken = window.localStorage.getItem('token');
        if (storedToken) {
          setLoading(false);
          const data = { type: 'validationToken', data: { token: storedToken } };
          ws.send(stringify(data));
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching data: ', error);
        setLoading(false);
      }
    };

    fetchData();

    return () => {
      ws.close();
    };
  }, []);


  const setLocalStorageItem = (value: any) => {
    window.localStorage.setItem('token', value);
  };

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'token') {
        setLocalStorageItem(event.newValue);
        const data = {
          type: 'validationToken',
          data: { token: window.localStorage.getItem('token') || 'undefined' }
        };
        ws.send(stringify(data));
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const stringify = (json: object) => {
    return JSON.stringify(json);
  };

  const setLogged = (user: User) => {
    setUser(user);
    setLoading(false);
  };

  return (
    <div className="App dark-mode theme-default no-reduce-motion">
      { loading && <BrowserRouter>
        <Switch>
          <Route path="/login" exact>
            {user.id ? (
              user.is_activated === '1' ? (
                <Dashboard isProfile={false} setUser={setUser} user={user} />
              ) : (
                <Ativar user={user} setLogged={setLogged} />
              )
            ) : (
              <Login registerSucess={false} setLogged={setLogged} />
            )}
          </Route>
          <Route path="/dashboard" exact>
            {user.id ? (
              user.is_activated === '1' ? (
                <Dashboard isProfile={false} setUser={setUser} user={user} />
              ) : (
                <Ativar user={user} setLogged={setLogged} />
              )
            ) : (
              <Login registerSucess={false} setLogged={setLogged} />
            )}
          </Route>
          <Route path="/spotify" exact>
            {user.id ? (
              user.is_activated === '1' ? (
                <Spotify />
              ) : (
                <Ativar user={user} setLogged={setLogged} />
              )
            ) : (
              <Login registerSucess={false} setLogged={setLogged} />
            )}
          </Route>
          <Route path="/chat" exact>
            {user.id ? (
              user.is_activated === '1' ? (
                <Dashboard isChat={true} isProfile={false} setUser={setUser} user={user} />
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
                <Dashboard isProfile={false} setUser={setUser} user={user} />
              ) : (
                <Ativar user={user} setLogged={setLogged} />
              )
            ) : (
              <Register registerSucess={false} setLogged={setLogged} />
            )}
          </Route>
          <Route path="/registerSuccessfully" exact>
            {user.id ? (
              user.is_activated === '1' ? (
                <Dashboard isProfile={false} setUser={setUser} user={user} />
              ) : (
                <Ativar user={user} setLogged={setLogged} />
              )
            ) : (
              <Login registerSucess={true} setLogged={setLogged} />
            )}
          </Route>
          <Route path="/u/:username/:discrimination/:user_id" exact>
            {user.id ? (
              user.is_activated == '1' ? (
                <Dashboard isProfile={true} setUser={setUser} user={user} />
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
                <Dashboard isProfile={false} setUser={setUser} user={user} />
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