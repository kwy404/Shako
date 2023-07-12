import { useState, useEffect } from 'react'
import {
  Link,
  Redirect
} from "react-router-dom"

import MyAlertDialog from "../../components/Alert";

const typePage = 'register'

const ws = new WebSocket('ws://localhost:9000/ws/register')

function getRandomChoicePhoto() {
  const choices = ['geek', 'anime', 'photo', 'cinema', 'error', 'space'];
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
            <div className={`login-box ${(error ? 'error': '')}`}>
              <form
              onSubmit={(e: any) => {
                e.preventDefault();
                const data = {type: 'userRegister', data: {email, password, username}};
                ws.send(stringy(data))
              }}
              >
                <div className="login-box-content">
                  <h1 className="title">Create a account</h1>
                  <label htmlFor="email">E-mail</label>
                  <input 
                  onKeyUp={(e) => setEmail((e.target as any).value)}
                  type="text" id="email" autoComplete="off"/>
                  <label htmlFor="email">Username</label>
                  <input 
                  onKeyUp={(e) => setUsername((e.target as any).value)}
                  type="text" id="email" autoComplete="off"/>
                  <label htmlFor="password">Password</label>
                  <input 
                  onKeyUp={(e) => setPassword((e.target as any).value)}
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
              </form>
            </div>
        </div>
        </div>
      </>
    )
}

export default Register