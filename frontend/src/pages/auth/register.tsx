import { useState, useEffect } from 'react'
import {
  Link,
  Redirect
} from "react-router-dom"

import MyAlertDialog from "../../components/Alert";
import TermosDeUso from '../../components/termos';

const typePage = 'register'

const ws = new WebSocket('ws://localhost:9005/ws/register')

function getRandomChoicePhoto() {
  const choices = ['geek', 'anime', 'rock', 'error', 'space', 'place', 'music'];
  const randomIndex = Math.floor(Math.random() * choices.length);
  return choices[randomIndex];
}

const randPhoto = getRandomChoicePhoto();

function Register(props: any) {
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(false);
    const [message, setMessage] = useState('');
    const [dialog, setDialog] = useState(true);
    const [termos, setTermos] = useState(false);
    
    useEffect(() => {
        ws.onmessage = (evt: any) => {
        // listen to data sent from the websocket server
          const message = JSON.parse(evt.data)
          if(message.type === 'login'){
            if(!message?.noMessageError){
              setError(!message.sucess)
              setMessage(message.message)
            }
            if(message.user?.id){
              window.localStorage.setItem('token', message.user.token)
              props.setLogged(message.user)
            } 
          } else if(message.type === typePage){
            setError(!message.sucess)
            setDialog(true)
            setMessage(message.message)
            if(message?.sucess){
              if(message?.redirect){
                window.location.pathname = `${message?.redirectUrl}`
              }
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
        <div className="App">
          <div className="login-container">
            <div className={`login-box ${(error ? 'error': '')}`}  style={{
            paddingRight: '20px',
          }}>
              <div className="login-box-content-line" style={{
                width: 'calc(100% + 20px)'
              }}/>
              {termos ? <>
                <div className="form-container" style={{
                'maxWidth': '450px',
                'padding': '0px',
                'paddingBottom': '0px',
                'margin': '50px auto',
                'height': '3px'
                }}>
                <div className="simple_form">
                  <ol className="progress-tracker" style={{
                    'top': '0',
                    'left': '-5px'
                  }}>
                      <li className="active">
                      <div className="circle"></div>
                      <div className="label">Accept rules</div>
                      </li>
                      <li className="separator"></li>
                      <li className="active">
                      <div className="circle"></div>
                      <div className="label">Your details</div>
                      </li>
                  </ol>
                  </div>
              </div>
              <form
              onSubmit={(e: any) => {
                e.preventDefault();
                const data = {type: 'userRegister', data: {email, password, username}};
                ws.send(stringy(data))
              }}
              >
                <div className="login-box-content">
                  <h1 className="title">Create an account</h1>
                  <label htmlFor="email">E-mail</label>
                  <input 
                  onKeyDown={(e) => setTimeout(() => setEmail((e.target as any).value), 100)}
                  type="text" id="email" autoComplete="off"/>
                  <label htmlFor="email">Username</label>
                  <input 
                  onKeyDown={(e) => setTimeout(() => setUsername((e.target as any).value), 100)}
                  type="text" id="email" autoComplete="off"/>
                  <label htmlFor="password">Password</label>
                  <input 
                  onKeyDown={(e) => setTimeout(() => setPassword((e.target as any).value), 100)}
                  type="password" id="password"/>
                  <span className='error' style={{
                    left: '27px',
                    position: 'relative'
                  }}>{ error && message }</span>
                  <p><a className="register" href="#">Forgot your password?</a></p>
                  <button>Register</button>
                  <p>Have a account? <Link 
                    to={'/login'}
                    className="register">Login</Link>
                  </p>
                </div>
              </form></> : <div style={{
                top: '25px',
                position: 'relative',
                paddingLeft: '15px'
              }}>
                  <TermosDeUso setTermos={setTermos}/>
              </div>}
            </div>
          </div>
        </div>
      </>
    )
}

export default Register