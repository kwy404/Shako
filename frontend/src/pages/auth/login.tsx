import { useState, useEffect } from 'react'
import MyAlertDialog from "../../components/Alert";
import Loading from "../../app/loading";

import {
  Link
} from "react-router-dom"

import { FaSpinner } from 'react-icons/fa';

const typePage = 'login'

const ws = new WebSocket('ws://localhost:9022/ws/login')

// Premium aesthetic background image
const PREMIUM_BG = 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=2070&auto=format&fit=crop';

function Login(props: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validationError, setValidationError] = useState('');
  const [error, setError] = useState(false);
  const [message, setMessage] = useState('');
  const [dialog, setDialog] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingButton, setLoadingButton] = useState(false);

  useEffect(() => {
    ws.onmessage = (evt: any) => {
      // listen to data sent from the websocket server
      const message = JSON.parse(evt.data)
      if (message.type === typePage) {
        if (!message?.noMessageError) {
          setError(!message.sucess)
          setDialog(true)
          setMessage(message.message)
          setLoadingButton(false);
        }
        if (message.user?.id) {
          window.localStorage.setItem('token', message.user.token)
          props.setLogged(message.user)
        }
      } else if (message.type == 'validateToken') {
        //Validate token and logged if sucess
        const data = { type: 'validationToken', data: { token: window.localStorage.getItem('token') ? window.localStorage.getItem('token') : 'undefined' } };
        ws.send(stringy(data))
      }
    }
    setTimeout(() => {
      setLoading(false);
    }, 1000)
  }, []);

  const stringy = (json: object) => {
    return JSON.stringify(json)
  }

  return (
    <div className="auth-page">
      <img className='background--image' src={PREMIUM_BG} alt="background" />
      <div className="background--overlay" />
      {loading ? <Loading /> : <>
        {error && <MyAlertDialog open={dialog} message={message} error="I made a mistake" setDialog={setDialog} />}
        {props.registerSucess && !error && <MyAlertDialog open={dialog} message={"Registration done successfully, login above using the same credentials."} error="🤩Thanks 🤩" setDialog={setDialog} />}
        <div className="App">
          <div className="login-container">
            <div className={`login-box ${(error ? 'error' : '')}`}>
              <div className="login-box-content-line" />
              <form
                onSubmit={(e: any) => {
                  e.preventDefault();
                  setValidationError('');

                  // Robust Validation
                  if (!email || !password) {
                    setValidationError('Please fill in all fields.');
                    return;
                  }

                  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                  if (!emailRegex.test(email)) {
                    setValidationError('Please enter a valid email address.');
                    return;
                  }

                  if (password.length < 6) {
                    setValidationError('Password must be at least 6 characters long.');
                    return;
                  }

                  if (!loadingButton) {
                    setLoadingButton(true);
                    const data = { type: 'userLogin', data: { email, password } };
                    ws.send(stringy(data))
                  }
                }}
              >

                <div className="login-box-content">
                  <h1 className="title">Welcome back!</h1>
                  <h4 className="subtitle">We're so excited to see you again!</h4>
                  <label htmlFor="email">E-mail</label>
                  <input
                    onChange={(e) => setEmail(e.target.value)}
                    value={email}
                    type="text" id="email" autoComplete="email" placeholder="Enter your email" />

                  <label htmlFor="password">Password</label>
                  <input
                    onChange={(e) => setPassword(e.target.value)}
                    value={password}
                    type="password" id="password" placeholder="Enter your password" />

                  <span className='error'>{(error || validationError) && (validationError || message)}</span>


                  {props.registerSucess && <h4 className="error subtitle" style={{
                    color: "#74da7285",
                    fontSize: '14px',
                    marginBottom: '10px',
                    userSelect: 'none'
                  }}>Registration done successfully, login above using the same credentials.</h4>}

                  <p><a className="register" href="#">Forgot your password?</a></p>
                  <button>{loadingButton ? <><FaSpinner className="spin animation--spine" /></> : <>Login</>}</button>
                  <p>Need an account? <Link
                    to={'/register'}
                    className="register">Register</Link>.</p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </>}
    </div>
  )
}

export default Login