import { useState, useEffect } from 'react'
import {
  Link,
  Redirect
} from "react-router-dom"

import MyAlertDialog from "../../components/Alert";
import TermosDeUso from '../../components/termos';
import { FaSpinner } from 'react-icons/fa';

const typePage = 'register'

const ws = new WebSocket('ws://localhost:9022/ws/register')

// Premium aesthetic background image
const PREMIUM_BG = 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=2070&auto=format&fit=crop';

function Register(props: any) {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [validationError, setValidationError] = useState('');
  const [error, setError] = useState(false);

  const [message, setMessage] = useState('');
  const [dialog, setDialog] = useState(true);
  const [termos, setTermos] = useState(false);
  const [loadingButton, setLoadingButton] = useState(false);

  useEffect(() => {
    ws.onmessage = (evt: any) => {
      // listen to data sent from the websocket server
      const message = JSON.parse(evt.data)
      if (message.type === 'login') {
        if (!message?.noMessageError) {
          setError(!message.sucess)
          setMessage(message.message)
        }
        if (message.user?.id) {
          window.localStorage.setItem('token', message.user.token)
          props.setLogged(message.user)
        }
      } else if (message.type === typePage) {
        setLoadingButton(false);
        setError(!message.sucess)
        setDialog(true)
        setMessage(message.message)
        if (message?.sucess) {
          if (message?.redirect) {
            window.location.pathname = `${message?.redirectUrl}`
          }
        }
      } else if (message.type == 'validateToken') {
        //Validate token and logged if sucess
        const data = { type: 'validationToken', data: { token: window.localStorage.getItem('token') ? window.localStorage.getItem('token') : 'undefined' } };
        ws.send(stringy(data))
      }
    }
  }, []);

  const stringy = (json: object) => {
    return JSON.stringify(json)
  }

  return (
    <div className="auth-page">
      <img className='background--image' src={PREMIUM_BG} alt="background" />
      <div className="background--overlay" />
      {error && <MyAlertDialog open={dialog} message={message || validationError} error="I made a mistake" setDialog={setDialog} />}

      <div className="App">
        <div className="login-container">
          <div className={`login-box ${(error ? 'error' : '')}`}>
            <div className="login-box-content-line" />
            <div className="login-box-content">
              {termos ? (
                <>
                  <div className="progress-container" style={{ width: '100%', marginBottom: '32px' }}>
                    <ol className="progress-tracker" style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '0',
                      margin: '0',
                      listStyle: 'none'
                    }}>
                      <li className="active" style={{ flex: 1, textAlign: 'center' }}>
                        <div className="circle" style={{ margin: '0 auto' }}></div>
                        <div className="label" style={{ fontSize: '11px', marginTop: '8px', color: 'rgba(255,255,255,0.6)' }}>Accept rules</div>
                      </li>
                      <li className="separator" style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)', alignSelf: 'center', margin: '0 10px', marginTop: '-15px' }}></li>
                      <li className="active" style={{ flex: 1, textAlign: 'center' }}>
                        <div className="circle" style={{ margin: '0 auto' }}></div>
                        <div className="label" style={{ fontSize: '11px', marginTop: '8px', color: 'rgba(255,255,255,0.6)' }}>Your details</div>
                      </li>
                    </ol>
                  </div>
                  <form
                    onSubmit={(e: any) => {
                      e.preventDefault();
                      setValidationError('');
                      if (!email || !username || !password) {
                        setValidationError('Please fill in all fields.');
                        setError(true);
                        return;
                      }
                      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                      if (!emailRegex.test(email)) {
                        setValidationError('Please enter a valid email address.');
                        setError(true);
                        return;
                      }
                      if (username.length < 3) {
                        setValidationError('Username must be at least 3 characters long.');
                        setError(true);
                        return;
                      }
                      if (password.length < 6) {
                        setValidationError('Password must be at least 6 characters long.');
                        setError(true);
                        return;
                      }
                      if (!loadingButton) {
                        const data = { type: 'userRegister', data: { email, password, username } };
                        ws.send(stringy(data))
                        setLoadingButton(true);
                      }
                    }}
                    style={{ display: 'flex', flexDirection: 'column' }}
                  >
                    <h1 className="title" style={{ textAlign: 'center', marginBottom: '24px', fontSize: '24px' }}>Create an account</h1>

                    <label htmlFor="email">E-mail</label>
                    <input
                      onChange={(e) => setEmail(e.target.value)}
                      value={email}
                      type="text" id="email" autoComplete="email" placeholder="Enter your email" />

                    <label htmlFor="username">Username</label>
                    <input
                      onChange={(e) => setUsername(e.target.value)}
                      value={username}
                      type="text" id="username" autoComplete="username" placeholder="Choose a username" />

                    <label htmlFor="password">Password</label>
                    <input
                      onChange={(e) => setPassword(e.target.value)}
                      value={password}
                      type="password" id="password" placeholder="Create a password" />

                    <span className='error' style={{ marginBottom: '16px', fontSize: '13px' }}>
                      {(error || validationError) && (validationError || message)}
                    </span>

                    {props.registerSucess && <h4 className="error subtitle" style={{
                      color: "#74da7285",
                      fontSize: '14px',
                      marginBottom: '10px',
                      textAlign: 'center'
                    }}>Registration successful!</h4>}

                    <button style={{ marginBottom: '16px' }}>
                      {loadingButton ? <FaSpinner className="spin animation--spine" /> : "Register"}
                    </button>

                    <p style={{ textAlign: 'center', margin: 0, fontSize: '14px' }}>
                      Already have an account? <Link to={'/login'} className="register">Login</Link>
                    </p>
                  </form>
                </>
              ) : (
                <div style={{ paddingTop: '10px' }}>
                  <TermosDeUso setTermos={setTermos} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register