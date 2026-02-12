import { useState, useEffect } from 'react'
import MyAlertDialog from "../../components/Alert";

import {
  Link
} from "react-router-dom"

import { FaSpinner } from 'react-icons/fa';
const typePage = 'validateCode'

const ws = new WebSocket('ws://localhost:9022/ws/validateCode')

// Premium aesthetic background image
const PREMIUM_BG = 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=2070&auto=format&fit=crop';

function Ativar(props: any) {
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);

  const [message, setMessage] = useState('');
  const [dialog, setDialog] = useState(true);
  const [loadingButton, setLoadingButton] = useState(false);

  useEffect(() => {
    ws.onmessage = (evt: any) => {
      // listen to data sent from the websocket server
      const message = JSON.parse(evt.data)
      if (message.type === typePage) {
        setLoadingButton(false);
        if (message?.redirect) {
          window.location.pathname = `${message?.redirectUrl}`
        }
        if (!message?.noMessageError) {
          setError(!message.sucess)
          setDialog(true)
          setMessage(message.message)
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
  }, []);

  const stringy = (json: object) => {
    return JSON.stringify(json)
  }

  return (
    <div className="auth-page">
      <img className='background--image' src={PREMIUM_BG} alt="background" />
      <div className="background--overlay" />
      {error && <MyAlertDialog open={dialog} message={message} error="I made a mistake" setDialog={setDialog} />}

      {props.registerSucess && !error && <MyAlertDialog open={dialog} message={"Registration done successfully, login above using the same credentials."} error="🤩Thanks 🤩" setDialog={setDialog} />}
      <div className="App">
        <div className="login-container">
          <div className={`login-box ${(error ? 'error' : '')}`}>
            <form
              onSubmit={(e: any) => {
                e.preventDefault();
                if (!loadingButton && code) {
                  setLoadingButton(true);
                  const data = { type: 'userValidateCode', data: { token: window.localStorage.getItem('token') ? window.localStorage.getItem('token') : 'undefined', codeAtivate: code } };
                  ws.send(stringy(data))
                }
              }}
            >

              <div className="login-box-content">
                <div className="login-box-content-line" />

                <h1 className="title">Glad you're here!</h1>
                <h4 className="subtitle">
                  Activate your account. We sent a code to <span style={{ color: 'rgba(255,255,255,.7)' }}>{props.user.email}</span>.
                </h4>
                <label htmlFor="code">Activation Code</label>
                <input
                  onChange={(e) => setCode(e.target.value)}
                  value={code}
                  type="text" id="code" autoComplete="off" placeholder="Enter your 6-digit code" />
                <span className='error'>{error && message}</span>

                <button>
                  {loadingButton ? <><FaSpinner className="spin animation--spine" /></> : <>Validate</>}
                </button>
                <p>I'ts not you? <Link
                  onClick={() => {
                    window.localStorage.setItem("token", "")
                    location.reload()
                  }}
                  to={'/login'}
                  className="register">Logout</Link>.</p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Ativar