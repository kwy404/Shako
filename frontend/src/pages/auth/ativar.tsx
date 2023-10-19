import { useState, useEffect } from 'react'
import MyAlertDialog from "../../components/Alert";

import {
  Link
} from "react-router-dom"

import { FaSpinner } from 'react-icons/fa';
const typePage = 'validateCode'

const ws = new WebSocket('ws://localhost:9022/ws/validateCode')

function getRandomChoicePhoto() {
  const choices = ['geek', 'anime', 'rock', 'error', 'space', 'place', 'music'];
  const randomIndex = Math.floor(Math.random() * choices.length);
  return choices[randomIndex];
}

const randPhoto = getRandomChoicePhoto();

function Ativar(props: any) {
    const [email, setEmail] = useState('');
    const [error, setError] = useState(false);
    const [message, setMessage] = useState('');
    const [dialog, setDialog] = useState(true);
    const [loadingButton, setLoadingButton] = useState(false);

    useEffect(() => {
        ws.onmessage = (evt: any) => {
        // listen to data sent from the websocket server
          const message = JSON.parse(evt.data)
          if(message.type === typePage){
            setLoadingButton(false);
            if(message?.redirect){
              window.location.pathname = `${message?.redirectUrl}`
            }
            if(!message?.noMessageError){
              setError(!message.sucess)
              setDialog(true)
              setMessage(message.message)
            }
            if(message.user?.id){
              window.localStorage.setItem('token', message.user.token)
              props.setLogged(message.user)
            }
          } else if(message.type == 'validateToken'){
            //Validate token and logged if sucess
            const data = {type: 'validationToken', data: {token: window.localStorage.getItem('token')?window.localStorage.getItem('token'): 'undefined'}};
            ws.send(stringy(data))
          }
        }
    }, []);
  
    const stringy = (json: object) => {
      return JSON.stringify(json)
    }
  
    return (
      <>
        <img className='background--image' src={`https://source.unsplash.com/random/1920%C3%971080/?${randPhoto}`}/>
        { error && <MyAlertDialog open={dialog} message={message} error="I made a mistake" setDialog={setDialog}/> }
        { props.registerSucess  && !error && <MyAlertDialog open={dialog} message={"Registration done successfully, login above using the same credentials."} error="🤩Thanks 🤩" setDialog={setDialog}/> }
        <div className="App">
          <div className="login-container">
            <div className={`login-box ${(error ? 'error': '')}`}>
              <form
              onSubmit={(e: any) => {
                e.preventDefault();
                if(!loadingButton){
                  setLoadingButton(true);
                  const data = {type: 'userValidateCode', data: {token: window.localStorage.getItem('token')?window.localStorage.getItem('token'): 'undefined', codeAtivate: email}};
                  ws.send(stringy(data))
                }
              }}
              >
                <div className="login-box-content">
                  <div className="login-box-content-line"
                  style={{
                    width: 'calc(100% + 80px)',
                    position: 'relative',
                    top: '-50px'
                  }}
                  />
                  <h1 className="title">I'm glad to you are here</h1>
                  <h4 className="subtitle" style={{
                    marginLeft: '35px'
                  }}>Activate your account, i send code to <span style={{
                    color: 'rgba(255,255,255,.7)'
                  }}>{props.user.email}.</span></h4>
                  <label htmlFor="code">Code</label>
                  <input 
                  onKeyDown={(e) => setTimeout(() => setEmail((e.target as any).value), 100)}
                  type="text" id="email" autoComplete="off"/>
                  <span className='error'>{ error && message }</span>
                  <br></br>
                  <button>
                  {loadingButton ? <><FaSpinner className="spin animation--spine" /></>: <>Validate</>}
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
      </>
    )
}

export default Ativar